from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from typing import Optional

from ..database import get_db
from ..api.deps import get_current_user
from ..models import User, Kontrahent, RachunekBankowy
from ..services.ksef_client import KsefInvoiceSync
from ..services.biala_lista import BialaListaVerifier
from ..services.payment_classifier import PaymentClassifier

router = APIRouter(prefix="/api/ksef", tags=["KSeF"])


@router.post("/sync")
async def sync_invoices_from_ksef(
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    background_tasks: BackgroundTasks = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Synchronizuje faktury zakupowe z KSeF API 2.0.
    """
    if not current_user.ksef_token:
        raise HTTPException(
            status_code=400,
            detail="Brak tokenu KSeF w profilu użytkownika",
        )

    if not current_user.firma_nip:
        raise HTTPException(
            status_code=400,
            detail="Brak NIP firmy w profilu użytkownika",
        )

    # Domyślnie zakres 30 dni, w UTC
    if date_from:
        date_from_dt = datetime.fromisoformat(date_from)
    else:
        date_from_dt = datetime.now(timezone.utc) - timedelta(days=30)

    if date_to:
        date_to_dt = datetime.fromisoformat(date_to)
    else:
        date_to_dt = datetime.now(timezone.utc)

    ksef_client = KsefInvoiceSync(
        token=current_user.ksef_token,
        environment="prod",
    )

    try:
        faktury_data = await ksef_client.sync_invoices(
            nip_nabywcy=current_user.firma_nip,
            date_from=date_from_dt,
            date_to=date_to_dt,
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Błąd połączenia z KSeF: {type(e).__name__}: {str(e)}",
        )

    nowe_faktury = []
    zaktualizowane = 0

    for fakt_data in faktury_data:
        # Sprawdź czy faktura już istnieje
        existing = db.query(Faktura).filter(
            Faktura.numer_ksef == fakt_data['numer_ksef']
        ).first()

        if existing:
            zaktualizowane += 1
            continue

        # Kontrahent (sprzedawca)
        kontrahent = await get_or_create_kontrahent(db, fakt_data['seller'])

        # Rachunek bankowy
        rachunek = None
        account_verified = False

        if fakt_data['payment']['rachunek']:
            rachunek = await get_or_create_rachunek(
                db, kontrahent.id, fakt_data['payment']
            )

            if fakt_data['payment']['forma'] == 6 and background_tasks:
                background_tasks.add_task(
                    verify_account_background,
                    db,
                    rachunek.id,
                    kontrahent.nip,
                    fakt_data['payment']['rachunek'],
                )
                account_verified = rachunek.status_biala_lista == 'ZWERYFIKOWANY'

        classification = PaymentClassifier.classify(
            fakt_data['payment']['forma'],
            account_verified,
        )

        faktura = Faktura(
            numer_ksef=fakt_data['numer_ksef'],
            numer_faktury=fakt_data['basic_info']['numer_faktury'],
            kontrahent_id=kontrahent.id,
            rachunek_id=rachunek.id if rachunek else None,
            data_wystawienia=fakt_data['basic_info']['data_wystawienia'],
            data_otrzymania=fakt_data.get('data_otrzymania'),
            termin_platnosci=fakt_data['payment']['termin_platnosci'],
            kwota_netto=fakt_data['amounts']['netto'],
            kwota_vat=fakt_data['amounts']['vat'],
            kwota_brutto=fakt_data['amounts']['brutto'],
            waluta=fakt_data['basic_info'].get('waluta', 'PLN'),
            forma_platnosci=fakt_data['payment']['forma'],
            opis_platnosci=fakt_data['payment'].get('opis'),
            status='NOWA',
            czy_do_eksportu=classification.get('export', True),
            kolor=classification.get('color'),
            xml_ksef=fakt_data['xml_original'],
        )

        db.add(faktura)
        nowe_faktury.append(faktura)

    db.commit()

    return {
        "success": True,
        "nowe_faktury": len(nowe_faktury),
        "zaktualizowane": zaktualizowane,
        "message": f"Pobrano {len(nowe_faktury)} nowych faktur z KSeF",
    }


async def get_or_create_kontrahent(db: Session, seller_data: dict) -> Kontrahent:
    kontrahent = db.query(Kontrahent).filter(
        Kontrahent.nip == seller_data['nip']
    ).first()

    if not kontrahent:
        kontrahent = Kontrahent(
            nip=seller_data['nip'],
            nazwa=seller_data['nazwa'],
            adres=seller_data.get('adres'),
            email=seller_data.get('email'),
            telefon=seller_data.get('telefon'),
        )
        db.add(kontrahent)
        db.flush()

    return kontrahent


async def get_or_create_rachunek(
    db: Session,
    kontrahent_id: int,
    payment_data: dict,
) -> RachunekBankowy:
    rachunek_iban = payment_data['rachunek']

    rachunek = db.query(RachunekBankowy).filter(
        RachunekBankowy.kontrahent_id == kontrahent_id,
        RachunekBankowy.iban == rachunek_iban,
    ).first()

    if not rachunek:
        rachunek = RachunekBankowy(
            kontrahent_id=kontrahent_id,
            numer_rachunku=rachunek_iban.replace('PL', ''),
            iban=rachunek_iban,
            nazwa_banku=payment_data.get('bank'),
            status_biala_lista='PENDING',
        )
        db.add(rachunek)
        db.flush()

    return rachunek


async def verify_account_background(
    db: Session,
    rachunek_id: int,
    nip: str,
    account: str,
):
    verifier = BialaListaVerifier()
    result = await verifier.verify_account(nip, account)

    rachunek = db.query(RachunekBankowy).get(rachunek_id)
    if rachunek:
        rachunek.status_biala_lista = result['status']
        rachunek.request_id = result.get('request_id')
        rachunek.data_weryfikacji = result.get('verified_at')
        rachunek.wazne_do = result.get('valid_until')
        db.commit()
