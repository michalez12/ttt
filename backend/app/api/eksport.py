from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from ..database import get_db
from ..api.deps import get_current_user
from ..models import User, Faktura, EksportBank
from ..services.bank_generator import BankXMLGenerator

router = APIRouter(prefix="/api/eksport", tags=["Eksport"])


@router.post("/generate")
async def generate_bank_xml(
    faktura_ids: List[int],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Generuje plik XML dla banku (pain.001.001.09) na podstawie wybranych faktur.
    """
    faktury = db.query(Faktura).filter(Faktura.id.in_(faktura_ids)).all()

    if not faktury:
        raise HTTPException(status_code=404, detail="Nie znaleziono faktur")

    invalid_faktury = []

    for faktura in faktury:
        if faktura.forma_platnosci != "6":
            invalid_faktury.append(
                {
                    "id": faktura.id,
                    "numer": faktura.numer_faktury,
                    "reason": "Forma pĹ‚atnoĹ›ci nie jest przelewem",
                }
            )
        elif not faktura.rachunek:
            invalid_faktury.append(
                {
                    "id": faktura.id,
                    "numer": faktura.numer_faktury,
                    "reason": "Brak rachunku bankowego",
                }
            )
        elif (
            faktura.rachunek.status_biala_lista not in ["ZWERYFIKOWANY"]
            and not getattr(faktura.rachunek, "ignore_biala_lista", False)
        ):
            invalid_faktury.append(
                {
                    "id": faktura.id,
                    "numer": faktura.numer_faktury,
                    "reason": "Rachunek niezweryfikowany w BiaĹ‚ej LiĹ›cie VAT",
                }
            )

    if invalid_faktury:
        raise HTTPException(
            status_code=400,
            detail={
                "message": "NiektĂłre faktury nie mogÄ… byÄ‡ wyeksportowane",
                "invalid": invalid_faktury,
            },
        )

    # Dane firmy z profilu uĹĽytkownika
    # JeĹ›li brak danych w profilu â€“ uĹĽyj wartoĹ›ci domyĹ›lnych
    firma_data = {
        "nazwa": current_user.firma_nazwa or "Brak nazwy firmy",
        "nip": current_user.firma_nip or "",
        "rachunek": current_user.firma_rachunek or "",
    }

    # Walidacja danych firmy
    if not firma_data["rachunek"]:
        raise HTTPException(
            status_code=400,
            detail="Brak rachunku bankowego w profilu uĹĽytkownika. "
                   "Zaktualizuj swĂłj profil przed eksportem."
        )

    faktury_data = []
    suma_kwot = 0.0

    for faktura in faktury:
        faktury_data.append(
            {
                "numer_ksef": faktura.numer_ksef,
                "numer_faktury": faktura.numer_faktury,
                "kontrahent_nazwa": faktura.kontrahent.nazwa,
                "kontrahent_nip": faktura.kontrahent.nip,
                "rachunek_iban": faktura.rachunek.iban,
                "nazwa_banku": faktura.rachunek.nazwa_banku,
                "kwota_brutto": float(faktura.kwota_brutto),
                "waluta": faktura.waluta,
                "termin_platnosci": faktura.termin_platnosci,
            }
        )
        suma_kwot += float(faktura.kwota_brutto)

    generator = BankXMLGenerator(firma_data)
    xml_content = generator.generate(faktury_data)

    nazwa_pliku = f"przelew_{datetime.now().strftime('%Y%m%d%H%M%S')}.xml"

    eksport = Eksport(
        data_eksportu=datetime.now(),
        nazwa_pliku=nazwa_pliku,
        format="XML",
        liczba_faktur=len(faktury),
        laczna_kwota=suma_kwot,
        status="WYGENEROWANY",
        plik_xml=xml_content,
        sciezka_pliku=None,
    )

    db.add(eksport)
    db.flush()

    for faktura in faktury:
        faktura.status = "WYEKSPORTOWANA"

    db.commit()

    return {
        "success": True,
        "eksport_id": eksport.id,
        "nazwa_pliku": nazwa_pliku,
        "liczba_faktur": len(faktury),
        "suma_kwot": suma_kwot,
        "message": "XML wygenerowany pomyĹ›lnie",
    }


@router.get("/history")
async def get_eksport_history(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Pobiera historiÄ™ eksportĂłw.
    """
    query = db.query(Eksport).order_by(Eksport.data_eksportu.desc())

    total = query.count()
    eksporty = query.offset(skip).limit(limit).all()

    result = []
    for eksport in eksporty:
        result.append(
            {
                "id": eksport.id,
                "nazwa_pliku": eksport.nazwa_pliku,
                "data_eksportu": eksport.data_eksportu.isoformat(),
                "liczba_faktur": eksport.liczba_faktur,
                "suma_kwot": float(eksport.laczna_kwota) if eksport.laczna_kwota else 0.0,
                "status": eksport.status,
            }
        )

    return {
        "total": total,
        "items": result,
        "skip": skip,
        "limit": limit,
    }


@router.get("/eksport/{eksport_id}/download")
async def download_eksport(
    eksport_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Pobiera plik XML eksportu.
    """
    eksport = db.query(Eksport).filter(Eksport.id == eksport_id).first()

    if not eksport:
        raise HTTPException(status_code=404, detail="Eksport nie znaleziony")

    if not eksport.plik_xml:
        raise HTTPException(status_code=404, detail="Brak XML dla tego eksportu")

    return Response(
        content=eksport.plik_xml,
        media_type="application/xml",
        headers={
            "Content-Disposition": f'attachment; filename="{eksport.nazwa_pliku}"'
        },
    )


@router.delete("/eksport/{eksport_id}")
async def delete_eksport(
    eksport_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Usuwa eksport (soft delete â€“ zmienia status).
    """
    eksport = db.query(Eksport).filter(Eksport.id == eksport_id).first()

    if not eksport:
        raise HTTPException(status_code=404, detail="Eksport nie znaleziony")

    eksport.status = "ANULOWANY"
    db.commit()

    return {
        "success": True,
        "message": "Eksport anulowany",
    }

