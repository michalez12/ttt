from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_

from ..database import get_db
from ..api.deps import get_current_user
from ..models import User, Kontrahent, RachunekBankowy
from ..services.biala_lista import BialaListaVerifier

router = APIRouter(prefix="/api/kontrahenci", tags=["Kontrahenci"])


@router.get("")
async def get_kontrahenci(
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Pobiera listę kontrahentów"""
    query = db.query(Kontrahent)

    if search:
        query = query.filter(
            or_(
                Kontrahent.nazwa.ilike(f"%{search}%"),
                Kontrahent.nip.ilike(f"%{search}%"),
            )
        )

    query = query.order_by(Kontrahent.nazwa)

    total = query.count()
    kontrahenci = query.offset(skip).limit(limit).all()

    result = []
    for kontrahent in kontrahenci:
        result.append(
            {
                "id": kontrahent.id,
                "nip": kontrahent.nip,
                "nazwa": kontrahent.nazwa,
                "adres": kontrahent.adres,
                "email": kontrahent.email,
                "telefon": kontrahent.telefon,
                "status_vat": getattr(kontrahent, "status_vat", None),
                "liczba_faktur": len(kontrahent.faktury),
                "liczba_rachunkow": len(kontrahent.rachunki),
            }
        )

    return {
        "total": total,
        "items": result,
        "skip": skip,
        "limit": limit,
    }


@router.get("/{kontrahent_id}")
async def get_kontrahent(
    kontrahent_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Pobiera szczegóły kontrahenta"""
    kontrahent = (
        db.query(Kontrahent)
        .filter(Kontrahent.id == kontrahent_id)
        .first()
    )

    if not kontrahent:
        raise HTTPException(status_code=404, detail="Kontrahent nie znaleziony")

    data_ostatniej_weryfikacji = getattr(
        kontrahent, "data_ostatniej_weryfikacji", None
    )

    return {
        "id": kontrahent.id,
        "nip": kontrahent.nip,
        "nazwa": kontrahent.nazwa,
        "adres": kontrahent.adres,
        "email": kontrahent.email,
        "telefon": kontrahent.telefon,
        "status_vat": getattr(kontrahent, "status_vat", None),
        "data_ostatniej_weryfikacji": data_ostatniej_weryfikacji.isoformat()
        if data_ostatniej_weryfikacji
        else None,
        "rachunki": [
            {
                "id": r.id,
                "iban": r.iban,
                "nazwa_banku": r.nazwa_banku,
                "status_biala_lista": r.status_biala_lista,
                "data_weryfikacji": r.data_weryfikacji.isoformat()
                if r.data_weryfikacji
                else None,
            }
            for r in kontrahent.rachunki
        ],
        "faktury": [
            {
                "id": f.id,
                "numer_faktury": f.numer_faktury,
                "data_wystawienia": f.data_wystawienia.isoformat(),
                "kwota_brutto": float(f.kwota_brutto),
                "status": f.status,
            }
            for f in kontrahent.faktury[:10]
        ],
    }


@router.post("/{kontrahent_id}/verify")
async def verify_kontrahent(
    kontrahent_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Weryfikuje kontrahenta w API MF (Biała Lista)"""
    kontrahent = (
        db.query(Kontrahent)
        .filter(Kontrahent.id == kontrahent_id)
        .first()
    )

    if not kontrahent:
        raise HTTPException(status_code=404, detail="Kontrahent nie znaleziony")

    verifier = BialaListaVerifier()
    result = await verifier.get_subject_info(kontrahent.nip)

    if result["found"]:
        # Te atrybuty mogą jeszcze nie istnieć w modelu – jeśli nie ma kolumn,
        # trzeba je dodać migracją lub usunąć te linie.
        if hasattr(kontrahent, "status_vat"):
            kontrahent.status_vat = result.get("status_vat")
        if hasattr(kontrahent, "data_ostatniej_weryfikacji"):
            kontrahent.data_ostatniej_weryfikacji = datetime.now()

        # Aktualizuj dane jeśli się zmieniły
        if result.get("nazwa"):
            kontrahent.nazwa = result["nazwa"]
        if result.get("adres"):
            kontrahent.adres = result["adres"]

        # Aktualizuj rachunki
        for rachunek_numer in result.get("rachunki", []):
            rachunek = (
                db.query(RachunekBankowy)
                .filter(
                    RachunekBankowy.kontrahent_id == kontrahent.id,
                    RachunekBankowy.iban == rachunek_numer,
                )
                .first()
            )

            if not rachunek:
                # Dodaj nowy rachunek
                rachunek = RachunekBankowy(
                    kontrahent_id=kontrahent.id,
                    numer_rachunku=rachunek_numer.replace("PL", ""),
                    iban=rachunek_numer,
                    status_biala_lista="ZWERYFIKOWANY",
                    data_weryfikacji=datetime.now(),
                )
                db.add(rachunek)

        db.commit()

        return {
            "success": True,
            "status_vat": result.get("status_vat"),
            "liczba_rachunkow": len(result.get("rachunki", [])),
            "message": "Kontrahent zweryfikowany pomyślnie",
        }
    else:
        return {
            "success": False,
            "message": result.get(
                "error", "Kontrahent nie znaleziony w rejestrze"
            ),
        }
