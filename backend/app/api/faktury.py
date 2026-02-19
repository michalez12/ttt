from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session, joinedload
from typing import Optional
from datetime import datetime

from ..database import get_db
from ..models import Faktura, Kontrahent, RachunekBankowy, User
from ..api.deps import get_current_user
from ..services.ksef_parser import KsefInvoiceParser
from ..services.payment_classifier import PaymentClassifier

router = APIRouter(prefix="/api/faktury", tags=["Faktury"])


def import_invoice_xml_bytes(xml_content: bytes, db: Session) -> Faktura:
    """
    Importuje fakturę z treści XML (FA3 z KSeF) do bazy i zwraca obiekt Faktura.
    Używa tej samej logiki, co upload_faktura_xml.
    """
    parser = KsefInvoiceParser(xml_content.decode("utf-8"))
    fakt_data = parser.parse()

    # Kontrahent (sprzedawca z faktury)
    seller = fakt_data["seller"]
    kontrahent = (
        db.query(Kontrahent)
        .filter(Kontrahent.nip == seller["nip"])
        .first()
    )
    if not kontrahent:
        kontrahent = Kontrahent(
            nip=seller["nip"],
            nazwa=seller["nazwa"],
            adres=seller.get("adres"),
            email=seller.get("email"),
            telefon=seller.get("telefon"),
        )
        db.add(kontrahent)
        db.flush()

    # Rachunek bankowy
    rachunek = None
    rachunek_id = None
    if fakt_data["payment"]["rachunek"]:
        rachunek = (
            db.query(RachunekBankowy)
            .filter(
                RachunekBankowy.kontrahent_id == kontrahent.id,
                RachunekBankowy.iban == fakt_data["payment"]["rachunek"],
            )
            .first()
        )
        if not rachunek:
            rachunek = RachunekBankowy(
                kontrahent_id=kontrahent.id,
                numer_rachunku=fakt_data["payment"]["rachunek"].replace("PL", ""),
                iban=fakt_data["payment"]["rachunek"],
                nazwa_banku=fakt_data["payment"].get("bank"),
                status_biala_lista="PENDING",
            )
            db.add(rachunek)
            db.flush()
        rachunek_id = rachunek.id

    # Sprawdź czy to korekta
    rodzaj_faktury = fakt_data["basic_info"].get("rodzaj_faktury", "VAT")
    czy_korekta = rodzaj_faktury in ["KOR", "KOREKTA"]
    numer_fa_org = fakt_data["basic_info"].get("numer_fa_oryginalnej")

    # Szukaj faktury oryginalnej dla korekty
    faktura_oryginalna_id = None
    if czy_korekta and numer_fa_org:
        faktura_org = (
            db.query(Faktura)
            .filter(
                Faktura.numer_faktury == numer_fa_org,
                Faktura.kontrahent_id == kontrahent.id,
            )
            .first()
        )
        if faktura_org:
            faktura_oryginalna_id = faktura_org.id

    # BLOKADA DUPLIKATÓW
    existing = (
        db.query(Faktura)
        .filter(
            Faktura.kontrahent_id == kontrahent.id,
            Faktura.numer_faktury == fakt_data["basic_info"]["numer_faktury"],
        )
        .first()
    )
    if existing:
        return existing

    # Klasyfikacja płatności / korekty
    forma_platnosci_id = fakt_data["payment"]["forma"]

    if czy_korekta:
        classification = PaymentClassifier.classify_korekta(
            fakt_data["amounts"]["brutto"],
            False,  # TODO: logika opóźnienia
        )
        czy_do_eksportu = (
            classification["export"]
            and forma_platnosci_id == 6
            and rachunek_id is not None
        )
    else:
        classification = PaymentClassifier.classify(
            forma_platnosci_id, False
        )
        czy_do_eksportu = (
            forma_platnosci_id == 6
            and fakt_data["payment"].get("termin_platnosci") is not None
            and rachunek_id is not None
        )

    faktura = Faktura(
        numer_ksef=fakt_data.get(
            "numer_ksef",
            f"MANUAL-{int(datetime.now().timestamp())}",
        ),
        numer_faktury=fakt_data["basic_info"]["numer_faktury"],
        kontrahent_id=kontrahent.id,
        rachunek_id=rachunek_id,
        data_wystawienia=fakt_data["basic_info"]["data_wystawienia"],
        termin_platnosci=fakt_data["payment"]["termin_platnosci"],
        kwota_netto=fakt_data["amounts"]["netto"],
        kwota_vat=fakt_data["amounts"]["vat"],
        kwota_brutto=fakt_data["amounts"]["brutto"],
        waluta=fakt_data["basic_info"].get("waluta", "PLN"),
        forma_platnosci=str(forma_platnosci_id),
        opis_platnosci=fakt_data["payment"].get("opis"),
        status="NOWA",
        czy_do_eksportu=czy_do_eksportu,
        kolor=classification["color"],
        xml_ksef=xml_content.decode("utf-8"),
        # UWAGA: rodzaj_faktury NIE jest przekazywany do modelu
        numer_fa_oryginalnej=numer_fa_org,
        czy_korekta=czy_korekta,
        faktura_oryginalna_id=faktura_oryginalna_id,
    )

    db.add(faktura)
    db.flush()
    db.refresh(faktura)

    return faktura


@router.get("")
async def get_faktury(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=500),
    kolor: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Pobierz listę faktur"""
    query = db.query(Faktura).options(
        joinedload(Faktura.kontrahent),
        joinedload(Faktura.rachunek)
    )

    if kolor:
        query = query.filter(Faktura.kolor == kolor)
    if status:
        query = query.filter(Faktura.status == status)

    total = query.count()
    faktury = query.offset(skip).limit(limit).all()

    items = []
    for f in faktury:
        items.append({
            "id": f.id,
            "numer_faktury": f.numer_faktury,
            "numer_ksef": f.numer_ksef,
            "data_wystawienia": f.data_wystawienia.isoformat() if f.data_wystawienia else None,
            "termin_platnosci": f.termin_platnosci.isoformat() if f.termin_platnosci else None,
            "kwota_netto": float(f.kwota_netto),
            "kwota_vat": float(f.kwota_vat),
            "kwota_brutto": float(f.kwota_brutto),
            "waluta": f.waluta,
            "forma_platnosci": f.forma_platnosci,
            "status": f.status,
            "kolor": f.kolor,
            "czy_do_eksportu": f.czy_do_eksportu,
            "kontrahent": {
                "id": f.kontrahent.id,
                "nazwa": f.kontrahent.nazwa,
                "nip": f.kontrahent.nip,
            } if f.kontrahent else None,
            "rachunek": {
                "id": f.rachunek.id,
                "iban": f.rachunek.iban,
                "nazwa_banku": f.rachunek.nazwa_banku,
                "status_biala_lista": f.rachunek.status_biala_lista,
            } if f.rachunek else None,
        })

    return {
        "total": total,
        "items": items,
        "skip": skip,
        "limit": limit,
    }


@router.get("/{faktura_id}")
async def get_faktura(
    faktura_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Pobierz szczegóły faktury"""
    faktura = db.query(Faktura).options(
        joinedload(Faktura.kontrahent),
        joinedload(Faktura.rachunek)
    ).filter(Faktura.id == faktura_id).first()
    
    if not faktura:
        raise HTTPException(status_code=404, detail="Faktura nie znaleziona")
    
    return {
        "id": faktura.id,
        "numer_faktury": faktura.numer_faktury,
        "numer_ksef": faktura.numer_ksef,
        "data_wystawienia": faktura.data_wystawienia.isoformat() if faktura.data_wystawienia else None,
        "termin_platnosci": faktura.termin_platnosci.isoformat() if faktura.termin_platnosci else None,
        "kwota_netto": float(faktura.kwota_netto),
        "kwota_vat": float(faktura.kwota_vat),
        "kwota_brutto": float(faktura.kwota_brutto),
        "waluta": faktura.waluta,
        "forma_platnosci": faktura.forma_platnosci,
        "opis_platnosci": faktura.opis_platnosci,
        "status": faktura.status,
        "kolor": faktura.kolor,
        "czy_do_eksportu": faktura.czy_do_eksportu,
        "rodzaj_faktury": getattr(faktura, "rodzaj_faktury", None),
        "czy_korekta": getattr(faktura, "czy_korekta", False),
        "kontrahent": {
            "id": faktura.kontrahent.id,
            "nazwa": faktura.kontrahent.nazwa,
            "nip": faktura.kontrahent.nip,
            "adres": faktura.kontrahent.adres,
        } if faktura.kontrahent else None,
        "rachunek": {
            "id": faktura.rachunek.id,
            "iban": faktura.rachunek.iban,
            "nazwa_banku": faktura.rachunek.nazwa_banku,
            "status_biala_lista": faktura.rachunek.status_biala_lista,
        } if faktura.rachunek else None,
    }


@router.post("/upload")
async def upload_faktura_xml(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Upload faktury XML z KSeF"""
    xml_content = await file.read()

    try:
        faktura = import_invoice_xml_bytes(xml_content, db)
        kontrahent = faktura.kontrahent

        db.commit()
        db.refresh(faktura)

        return {
            "success": True,
            "faktura_id": faktura.id,
            "numer_faktury": faktura.numer_faktury,
            "kontrahent": kontrahent.nazwa if kontrahent else None,
            "kwota": float(faktura.kwota_brutto),
            "kolor": faktura.kolor,
            "czy_do_eksportu": faktura.czy_do_eksportu,
            "czy_korekta": getattr(faktura, "czy_korekta", False),
            "rodzaj_faktury": getattr(faktura, "rodzaj_faktury", None),
            "message": "Faktura zaimportowana pomyślnie",
        }
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=400, detail=f"Błąd importu: {str(e)}"
        )


@router.post("/{faktura_id}/verify")
async def verify_faktura(
    faktura_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Weryfikuj rachunek bankowy w Białej Liście VAT"""
    from ..services.biala_lista import BialaListaVerifier

    faktura = db.query(Faktura).filter(Faktura.id == faktura_id).first()
    if not faktura:
        raise HTTPException(status_code=404, detail="Faktura nie znaleziona")

    if not faktura.rachunek:
        raise HTTPException(
            status_code=400,
            detail="Faktura nie ma przypisanego rachunku",
        )

    if not faktura.kontrahent or not faktura.kontrahent.nip:
        raise HTTPException(
            status_code=400,
            detail="Brak kontrahenta lub NIP dla faktury",
        )

    try:
        biala_lista = BialaListaVerifier()
        result = await biala_lista.get_subject_info(faktura.kontrahent.nip)

        if not result.get("found"):
            faktura.rachunek.status_biala_lista = "NIE_ZWERYFIKOWANY"
            faktura.rachunek.data_weryfikacji = datetime.now()
            db.commit()
            return {
                "success": False,
                "verified": False,
                "status_biala_lista": faktura.rachunek.status_biala_lista,
                "message": result.get(
                    "error",
                    "Kontrahent/rachunek nie znaleziony w rejestrze",
                ),
            }

        api_accounts = set(result.get("rachunki", []))
        is_on_white_list = faktura.rachunek.iban in api_accounts

        faktura.rachunek.status_biala_lista = (
            "ZWERYFIKOWANY" if is_on_white_list else "NIE_ZWERYFIKOWANY"
        )
        faktura.rachunek.data_weryfikacji = datetime.now()

        db.commit()

        return {
            "success": True,
            "verified": is_on_white_list,
            "status_biala_lista": faktura.rachunek.status_biala_lista,
            "iban": faktura.rachunek.iban,
            "nip": faktura.kontrahent.nip,
            "message": "Rachunek jest na Białej Liście"
            if is_on_white_list
            else "Rachunek nie znajduje się na Białej Liście dla tego NIP",
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Błąd weryfikacji: {str(e)}"
        )


@router.patch("/{faktura_id}/status")
async def update_faktura_status(
    faktura_id: int,
    status: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Zaktualizuj status faktury"""
    faktura = db.query(Faktura).filter(Faktura.id == faktura_id).first()
    if not faktura:
        raise HTTPException(status_code=404, detail="Faktura nie znaleziona")

    faktura.status = status
    db.commit()

    return {"success": True, "message": "Status zaktualizowany"}


@router.patch("/{faktura_id}/export-flag")
async def update_export_flag(
    faktura_id: int,
    do_eksportu: bool,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Ręczne ustawienie flagi czy_do_eksportu dla faktury"""
    faktura = db.query(Faktura).filter(Faktura.id == faktura_id).first()
    if not faktura:
        raise HTTPException(status_code=404, detail="Faktura nie znaleziona")

    faktura.czy_do_eksportu = do_eksportu
    db.commit()
    db.refresh(faktura)

    return {
        "success": True,
        "faktura_id": faktura.id,
        "numer_faktury": faktura.numer_faktury,
        "czy_do_eksportu": faktura.czy_do_eksportu,
    }


@router.get("/{faktura_id}/korekty")
async def get_korekty(
    faktura_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Pobierz korekty do faktury"""
    faktura = db.query(Faktura).filter(Faktura.id == faktura_id).first()
    if not faktura:
        raise HTTPException(status_code=404, detail="Faktura nie znaleziona")

    korekty = (
        db.query(Faktura)
        .filter(Faktura.faktura_oryginalna_id == faktura_id)
        .all()
    )

    return {
        "faktura_oryginalna": {
            "id": faktura.id,
            "numer": faktura.numer_faktury,
            "kwota": float(faktura.kwota_brutto),
        },
        "korekty": [
            {
                "id": k.id,
                "numer": k.numer_faktury,
                "kwota": float(k.kwota_brutto),
                "data": k.data_wystawienia.isoformat(),
                "kolor": k.kolor,
            }
            for k in korekty
        ],
        "total": len(korekty),
    }
