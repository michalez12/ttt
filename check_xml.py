from app.models import Faktura
from app.database import SessionLocal
import xml.etree.ElementTree as ET

db = SessionLocal()
f = db.query(Faktura).filter(Faktura.xml_ksef != None).first()
root = ET.fromstring(f.xml_ksef)
ns = root.tag.split('}')[0].strip('{')
wiersze = root.findall(f'.//{{{ns}}}FaWiersz')
if wiersze:
    print(f"Liczba wierszy: {len(wiersze)}")
    print("Tagi pierwszego wiersza:")
    for child in wiersze[0]:
        print(f"  {child.tag.split('}')[-1]} = {child.text}")
else:
    print("Brak FaWiersz w XML")
db.close()
