from app.models import Faktura, PozycjaFaktury
from app.database import SessionLocal
from app.services.ksef_parser import KsefInvoiceParser

db = SessionLocal()

deleted = db.query(PozycjaFaktury).delete()
print(f"Usunięto starych pozycji: {deleted}")

faktury = db.query(Faktura).filter(Faktura.xml_ksef != None).all()
print(f"Faktur z XML: {len(faktury)}")
count = 0
errors = 0

for f in faktury:
    try:
        parser = KsefInvoiceParser(f.xml_ksef)
        data = parser.parse()
        items = data.get("items", [])
        for idx, item in enumerate(items, start=1):
            p = PozycjaFaktury(
                faktura_id=f.id,
                numer_pozycji=item.get("numer") or idx,
                nazwa=item.get("nazwa") or "-",
                indeks=item.get("indeks"),
                kod_cn=item.get("kod_cn"),
                gtu=item.get("gtu"),
                ilosc=item.get("ilosc"),
                jednostka=item.get("jednostka"),
                cena_netto=item.get("cena_netto"),
                rabat=item.get("rabat"),
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
