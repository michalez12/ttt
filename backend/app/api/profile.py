from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from ..database import get_db
from ..api.deps import get_current_user
from ..models import User

router = APIRouter(prefix="/api/profile", tags=["Profile"])


class FirmaUpdate(BaseModel):
    firma_nazwa: str | None = None
    firma_nip: str | None = None
    firma_rachunek: str | None = None
    ksef_token: str | None = None


@router.get("/me")
async def get_profile(
    current_user: User = Depends(get_current_user),
):
    """Pobiera profil aktualnie zalogowanego użytkownika."""
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "firma_nazwa": current_user.firma_nazwa,
        "firma_nip": current_user.firma_nip,
        "firma_rachunek": current_user.firma_rachunek,
        "ksef_token_set": bool(current_user.ksef_token),
    }


@router.put("/firma")
async def update_firma(
    firma: FirmaUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Aktualizuje dane firmowe w profilu użytkownika."""

    if firma.firma_nazwa is not None:
        current_user.firma_nazwa = firma.firma_nazwa
    if firma.firma_nip is not None:
        current_user.firma_nip = firma.firma_nip
    if firma.firma_rachunek is not None:
        current_user.firma_rachunek = firma.firma_rachunek
    if firma.ksef_token is not None:
        current_user.ksef_token = firma.ksef_token

    db.commit()
    db.refresh(current_user)

    return {
        "success": True,
        "message": "Dane firmowe zaktualizowane",
        "firma_nazwa": current_user.firma_nazwa,
        "firma_nip": current_user.firma_nip,
        "firma_rachunek": current_user.firma_rachunek,
        "ksef_token_set": bool(current_user.ksef_token),
    }
