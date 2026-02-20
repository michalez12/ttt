from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from ..database import get_db
from ..api.deps import get_current_user
from ..models import User, Faktura
from ..models.eksport import EksportBank
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

    invalid_faktury: list[dict] = []

    for faktura in faktury:
        # Normalizacja kodu formy płatności do stringa
        kod = (
            str(faktura.forma_platnosci).strip()
            if faktura.forma_platnosci is not None
            else ""
        )

        if kod != "6":
            invalid_faktury.append(
                {
                    "id": faktura.id,
                    "numer": faktura.numer_faktury,
                    "reason": "Forma płatności nie jest przelewem",
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
        # brak sprawdzania status_biala_lista – dowolny rachunek przechodzi

    if invalid_faktury:
        raise HTTPException(
            status_code=400,
            detail={
                "message": "Niektóre faktury nie mogą być wyeksportowane",
                "invalid": invalid_faktury,
            },
        )

    # Dane firmy z profilu użytkownika
    firma_data = {
        "nazwa": current_user.firma_nazwa or "Brak nazwy firmy",
        "nip": current_user.firma_nip or "",
        "rachunek": current_user.firma_rachunek or "",
    }

    # Walidacja danych firmy
    if not firma_data["rachunek"]:
        raise HTTPException(
            status_code=400,
            detail=(
                "Brak rachunku bankowego w profilu użytkownika. "
                "Zaktualizuj swój profil przed eksportem."
            ),
        )

    faktury_data: list[dict] = []
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

    eksport_record = EksportBank(
        data_eksportu=datetime.now(),
        nazwa_pliku=nazwa_pliku,
        format="XML",
        liczba_faktur=len(faktury),
        laczna_kwota=suma_kwot,
        status="WYGENEROWANY",
        plik_xml=xml_content,
        sciezka_pliku=None,
    )

    db.add(eksport_record)
    db.flush()

    for faktura in faktury:
        faktura.status = "WYEKSPORTOWANA"

    db.commit()

    return {
        "success": True,
        "eksport_id": eksport_record.id,
        "nazwa_pliku": nazwa_pliku,
        "liczba_faktur": len(faktury),
        "suma_kwot": suma_kwot,
        "message": "XML wygenerowany pomyślnie",
    }


@router.get("/history")
async def get_eksport_history(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Pobiera historię eksportów.
    """
    query = db.query(EksportBank).order_by(EksportBank.data_eksportu.desc())
    total = query.count()
    eksporty = query.offset(skip).limit(limit).all()

    result: list[dict] = []
    for eksport_record in eksporty:
        result.append(
            {
                "id": eksport_record.id,
                "nazwa_pliku": eksport_record.nazwa_pliku,
                "data_eksportu": eksport_record.data_eksportu.isoformat(),
                "liczba_faktur": eksport_record.liczba_faktur,
                "suma_kwot": float(eksport_record.laczna_kwota)
                if eksport_record.laczna_kwota
                else 0.0,
                "status": eksport_record.status,
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
    eksport_record = (
        db.query(EksportBank).filter(EksportBank.id == eksport_id).first()
    )

    if not eksport_record:
        raise HTTPException(status_code=404, detail="Eksport nie znaleziony")

    if not eksport_record.plik_xml:
        raise HTTPException(
            status_code=404, detail="Brak XML dla tego eksportu"
        )

    return Response(
        content=eksport_record.plik_xml,
        media_type="application/xml",
        headers={
            "Content-Disposition": f'attachment; filename="{eksport_record.nazwa_pliku}"'
        },
    )


@router.delete("/eksport/{eksport_id}")
async def delete_eksport(
    eksport_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Usuwa eksport (soft delete – zmienia status).
    """
    eksport_record = (
        db.query(EksportBank).filter(EksportBank.id == eksport_id).first()
    )

    if not eksport_record:
        raise HTTPException(status_code=404, detail="Eksport nie znaleziony")

    eksport_record.status = "ANULOWANY"
    db.commit()

    return {
        "success": True,
        "message": "Eksport anulowany",
    }
