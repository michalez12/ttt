from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

from ..ksef_sync import sync_ksef_purchases

router = APIRouter(prefix="/sync", tags=["sync"])


class SyncPurchasesRequest(BaseModel):
    nip: str
    token: str
    from_date: Optional[datetime] = None
    to_date: Optional[datetime] = None


@router.post("/purchases")
def sync_purchases(body: SyncPurchasesRequest):
    imported = sync_ksef_purchases(
        nip=body.nip,
        token=body.token,
        from_dt=body.from_date,
        to_dt=body.to_date,
    )

    return {
        "imported_invoices": imported,
        "nip": body.nip,
        "from_date": body.from_date,
        "to_date": body.to_date,
    }