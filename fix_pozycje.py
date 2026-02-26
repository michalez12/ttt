from app.models import Faktura, PozycjaFaktury
from app.database import SessionLocal
from app.services.ksef_parser import KsefInvoiceParser

db = SessionLocal()
faktury = db.query(Faktura).filter(Faktura.xml_ksef != None).all()
print(f"Faktur z XML: {len(faktury)}")
count = 0
errors = 0

for f in faktury:
    existing = db.query(PozycjaFaktury).filter(PozycjaFaktury.faktura_id == f.id).count()
    if existing > 0:
        continue
    try:
        parser = KsefInvoiceParser(f.xml_ksef)
        data = parser.parse()
        items = data.get("items", [])
        for idx, item in enumerate(items, start=1):
            p = PozycjaFaktury(
                faktura_id=f.id,
                numer_pozycji=item.get("numer") or idx,
                nazwa=item.get("nazwa") or "-",
                ilosc=item.get("ilosc"),
                jednostka=item.get("jednostka"),
                cena_netto=item.get("cena_netto"),
                wartosc_netto=item.get("wartosc_netto"),
                stawka_vat=item.get("stawka_vat"),
                kwota_vat=item.get("kwota_vat"),
                wartosc_brutto=item.get("wartosc_brutto"),
            )
            db.add(p)
        count += 1
    except Exception as e:
        print(f"Blad {f.numer_faktury}: {e}")
        errors += 1

db.commit()
print(f"Dodano pozycje dla {count} faktur, bledy: {errors}")
db.close()
