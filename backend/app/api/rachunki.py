from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..api.deps import get_current_user
from ..models import User, RachunekBankowy, Kontrahent
from ..services.biala_lista import BialaListaVerifier

router = APIRouter(prefix="/api/rachunki", tags=["Rachunki"])


@router.get("/")
async def list_rachunki(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Lista rachunków bankowych kontrahentów.
    """
    rachunki = db.query(RachunekBankowy).all()
    return rachunki


@router.get("/{rachunek_id}")
async def get_rachunek(
    rachunek_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Szczegóły rachunku bankowego.
    """
    rachunek = (
        db.query(RachunekBankowy)
        .filter(RachunekBankowy.id == rachunek_id)
        .first()
    )

    if not rachunek:
        raise HTTPException(status_code=404, detail="Rachunek nie znaleziony")

    return rachunek


@router.post("/{rachunek_id}/verify")
async def verify_rachunek(
    rachunek_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Weryfikuje rachunek bankowy kontrahenta w Białej Liście VAT.
    """
    rachunek = (
        db.query(RachunekBankowy)
        .filter(RachunekBankowy.id == rachunek_id)
        .first()
    )

    if not rachunek:
        raise HTTPException(status_code=404, detail="Rachunek nie znaleziony")

    if not rachunek.kontrahent or not rachunek.kontrahent.nip:
        raise HTTPException(
            status_code=400,
            detail="Brak kontrahenta lub NIP dla rachunku",
        )

    verifier = BialaListaVerifier()
    result = await verifier.get_subject_info(rachunek.kontrahent.nip)

    if not result.get("found"):
        rachunek.status_biala_lista = "NIE_ZWERYFIKOWANY"
        rachunek.data_weryfikacji = datetime.now()
        db.commit()
        return {
            "success": False,
            "verified": False,
            "status_biala_lista": rachunek.status_biala_lista,
            "iban": rachunek.iban,
            "nip": rachunek.kontrahent.nip,
            "message": result.get(
                "error", "Kontrahent/rachunek nie znaleziony w rejestrze"
            ),
        }

    api_accounts = set(result.get("rachunki", []))
    is_on_white_list = rachunek.iban in api_accounts

    rachunek.status_biala_lista = (
        "ZWERYFIKOWANY" if is_on_white_list else "NIE_ZWERYFIKOWANY"
    )
    rachunek.data_weryfikacji = datetime.now()
    db.commit()

    return {
        "success": True,
        "verified": is_on_white_list,
        "status_biala_lista": rachunek.status_biala_lista,
        "iban": rachunek.iban,
        "nip": rachunek.kontrahent.nip,
        "message": "Rachunek jest na Białej Liście"
        if is_on_white_list
        else "Rachunek nie znajduje się na Białej Liście dla tego NIP",
    }


@router.patch("/{rachunek_id}/ignore-biala-lista")
async def set_ignore_biala_lista(
    rachunek_id: int,
    ignore: bool,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Oznacza rachunek jako wyjątek Białej Listy (np. rachunek faktoringowy).
    Jeśli ignore=True – eksporter będzie traktował go jak dozwolony
    mimo braku potwierdzenia w Białej Liście.
    """
    rachunek = (
        db.query(RachunekBankowy)
        .filter(RachunekBankowy.id == rachunek_id)
        .first()
    )

    if not rachunek:
        raise HTTPException(status_code=404, detail="Rachunek nie znaleziony")

    rachunek.ignore_biala_lista = ignore
    db.commit()
    db.refresh(rachunek)

    return {
        "success": True,
        "rachunek_id": rachunek.id,
        "iban": rachunek.iban,
        "ignore_biala_lista": rachunek.ignore_biala_lista,
        "message": (
            "Rachunek oznaczony jako wyjątek Białej Listy"
            if ignore
            else "Rachunek nie jest już wyjątkiem Białej Listy"
        ),
    }
