# backend/app/ksef_sync.py
from datetime import datetime, timedelta, timezone
from pathlib import Path
import time
import tempfile
import zipfile

from ksef2 import Client, FormSchema
from ksef2.domain.models import (
    InvoiceQueryFilters,
    InvoiceSubjectType,
    InvoiceQueryDateRange,
    DateType,
)

from sqlalchemy.orm import Session
from .api.faktury import import_invoice_xml_bytes
from .database import SessionLocal


def sync_ksef_purchases(
    nip: str,
    token: str,
    from_dt: datetime | None = None,
    to_dt: datetime | None = None,
) -> int:
    """
    Synchronizuje faktury zakupowe (subject2) z KSeF i importuje do bazy.
    Zwraca liczbę zaimportowanych faktur.
    """

    client = Client()  # PROD

    # 1) Autoryzacja tokenem
    auth = client.auth.authenticate_token(ksef_token=token, nip=nip)

    # 2) Zakres dat (domyślnie ostatnie 3 mies., max co pozwala KSeF)
    if to_dt is None:
        to_dt = datetime.now(tz=timezone.utc)
    if from_dt is None:
        from_dt = to_dt - timedelta(days=90)

    # 3) Sesja ONLINE + eksport tylko zakupów (subject2)
    with client.sessions.open_online(
        access_token=auth.access_token,
        form_code=FormSchema.FA3,
    ) as session:
        export = session.schedule_invoices_export(
            filters=InvoiceQueryFilters(
                subject_type=InvoiceSubjectType.SUBJECT2,
                date_range=InvoiceQueryDateRange(
                    date_type=DateType.ISSUE,
                    from_=from_dt,
                    to=to_dt,
                ),
            )
        )

        # Polling statusu
        status = None
        for _ in range(10):
            status = session.get_export_status(
                reference_number=export.reference_number
            )
            if status.package:
                break
            time.sleep(5)

        if not status or not status.package:
            return 0

        # 4) Pobranie paczki i import XML
        imported_count = 0
        with tempfile.TemporaryDirectory() as tmpdir:
            tmpdir = Path(tmpdir)

            downloaded_files: list[Path] = []
            for path in session.fetch_package(
                package=status.package,
                target_directory=str(tmpdir),
            ):
                downloaded_files.append(Path(path))

            for zip_path in downloaded_files:
                imported_count += _import_zip(zip_path)

    return imported_count


def _import_zip(zip_path: Path) -> int:
    import logging
    logger = logging.getLogger(__name__)

    count = 0
    with zipfile.ZipFile(zip_path, "r") as zf:
        with tempfile.TemporaryDirectory() as tmpdir:
            tmpdir = Path(tmpdir)
            zf.extractall(tmpdir)

            db: Session = SessionLocal()
            try:
                for xml_file in tmpdir.rglob("*.xml"):
                    xml_bytes = xml_file.read_bytes()
                    logger.info(f"Importing XML file: {xml_file}")
                    import_invoice_xml_bytes(xml_bytes, db)
                    count += 1
                db.commit()
            except Exception as e:
                logger.exception(f"Error while importing XML file {xml_file}: {e}")
                db.rollback()
                raise
            finally:
                db.close()

    return count
