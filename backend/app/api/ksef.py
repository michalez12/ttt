from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from typing import Optional

from ..database import get_db
from ..api.deps import get_current_user
from ..models import User
from ..ksef_sync import sync_ksef_purchases  # <-- używamy działającego mechanizmu

router = APIRouter(prefix="/api/ksef", tags=["KSeF"])


@router.post("/sync")
async def sync_invoices_from_ksef(
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Synchronizuje faktury zakupowe z KSeF.
    Używa biblioteki ksef2 (nowe flow) – ten sam mechanizm co /sync/purchases.
    """
    if not current_user.ksef_token:
        raise HTTPException(
            status_code=400,
            detail="Brak tokenu KSeF w profilu użytkownika. Uzupełnij w zakładce Profil.",
        )

    if not current_user.firma_nip:
        raise HTTPException(
            status_code=400,
            detail="Brak NIP firmy w profilu użytkownika. Uzupełnij w zakładce Profil.",
        )

    # Parsowanie dat
    if date_from:
        try:
            date_from_dt = datetime.fromisoformat(date_from).replace(tzinfo=timezone.utc)
        except ValueError:
            date_from_dt = datetime.now(timezone.utc) - timedelta(days=30)
    else:
        date_from_dt = datetime.now(timezone.utc) - timedelta(days=30)

    if date_to:
        try:
            date_to_dt = datetime.fromisoformat(date_to).replace(tzinfo=timezone.utc)
        except ValueError:
            date_to_dt = datetime.now(timezone.utc)
    else:
        date_to_dt = datetime.now(timezone.utc)

    try:
        # Używamy tego samego mechanizmu co /sync/purchases (biblioteka ksef2)
        imported = sync_ksef_purchases(
            nip=current_user.firma_nip,
            token=current_user.ksef_token,
            from_dt=date_from_dt,
            to_dt=date_to_dt,
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Błąd synchronizacji z KSeF: {type(e).__name__}: {str(e)}",
        )

    return {
        "success": True,
        "nowe_faktury": imported,
        "zaktualizowane": 0,
        "message": f"Pobrano {imported} nowych faktur z KSeF",
    }
