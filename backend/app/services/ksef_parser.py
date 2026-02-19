import xml.etree.ElementTree as ET
from datetime import datetime, date
from typing import Dict, Any, Optional


class KsefInvoiceParser:
    """Parser faktur XML z KSeF (FA)."""

    def __init__(self, xml_content: str):
        self.xml_content = xml_content
        self.root = None
        self.ns: str = ""

    def parse(self) -> Dict[str, Any]:
        self.root = ET.fromstring(self.xml_content)
        self.ns = self.root.tag.split('}')[0].strip('{') if '}' in self.root.tag else ''
        if self.root.tag.endswith('Faktura'):
            return self._parse_fa_format()
        raise ValueError(f"Nieobsługiwany format XML: {self.root.tag}")

    def _parse_fa_format(self) -> Dict[str, Any]:
        fa = self.root.find(f'.//{{{self.ns}}}Fa')
        platnosc = self.root.find(f'.//{{{self.ns}}}Platnosc')
        podmiot1 = self.root.find(f'.//{{{self.ns}}}Podmiot1')
        podmiot2 = self.root.find(f'.//{{{self.ns}}}Podmiot2')

        return {
            # numer_ksef ustawiamy po stronie KsefInvoiceSync
            "basic_info": self._parse_basic_info_fa(fa),
            "seller": self._parse_podmiot(podmiot1),
            "buyer": self._parse_podmiot(podmiot2),
            "amounts": self._parse_amounts_fa(fa),
            "payment": self._parse_payment_fa(platnosc),
            "items": self._parse_items_fa(fa),
        }

    def _parse_basic_info_fa(self, fa) -> Dict[str, Any]:
        numer = self._get_text(fa, 'P_2')
        data_wyst = self._get_text(fa, 'P_1')
        waluta = self._get_text(fa, 'KodWaluty', default='PLN')
        rodzaj_faktury = self._get_text(fa, 'RodzajFaktury', default='VAT')
        numer_fa_org = None
        if rodzaj_faktury in ['KOR', 'KOREKTA']:
            numer_fa_org = self._get_text(fa, 'P_2A')

        return {
            "numer_faktury": numer,
            "data_wystawienia": self._parse_date(data_wyst),
            "waluta": waluta,
            "rodzaj_faktury": rodzaj_faktury,
            "numer_fa_oryginalnej": numer_fa_org,
        }

    def _parse_podmiot(self, podmiot) -> Dict[str, Any]:
        if podmiot is None:
            return {
                "nip": None,
                "nazwa": None,
                "adres": None,
                "email": None,
                "telefon": None,
            }

        dane_id = podmiot.find(f'.//{{{self.ns}}}DaneIdentyfikacyjne')
        adres = podmiot.find(f'.//{{{self.ns}}}Adres')
        kontakt = podmiot.find(f'.//{{{self.ns}}}DaneKontaktowe')

        nip = self._get_text(dane_id, 'NIP')
        nazwa = self._get_text(dane_id, 'Nazwa')
        adres_txt = self._get_text(adres, 'AdresL1')
        email = self._get_text(kontakt, 'Email') if kontakt is not None else None
        telefon = self._get_text(kontakt, 'Telefon') if kontakt is not None else None

        return {
            "nip": nip,
            "nazwa": nazwa,
            "adres": adres_txt,
            "email": email,
            "telefon": telefon,
        }

    def _parse_amounts_fa(self, fa) -> Dict[str, float]:
        netto = self._get_decimal(fa, 'P_13_1')
        vat = self._get_decimal(fa, 'P_14_1')
        brutto = self._get_decimal(fa, 'P_15')
        return {"netto": netto, "vat": vat, "brutto": brutto}

    def _parse_payment_fa(self, platnosc) -> Dict[str, Any]:
        if platnosc is None:
            return {
                "forma": 8,
                "termin_platnosci": None,
                "rachunek": None,
                "bank": None,
                "opis": None,
            }

        forma_plat_text = self._get_text(platnosc, 'FormaPlat')
        forma_kod = self._get_text(platnosc, 'FormaPlatnosci')

        if forma_plat_text:
            forma = self._map_forma_platnosci_text(forma_plat_text)
        elif forma_kod:
            forma = self._map_forma_platnosci(forma_kod)
        else:
            forma = 8

        termin_el = platnosc.find(f'.//{{{self.ns}}}TerminPlatnosci')
        termin = self._get_text(termin_el, 'Termin') if termin_el is not None else None
        termin_date = self._parse_date(termin) if termin else None

        rachunek_el = (
            platnosc.find(f'.//{{{self.ns}}}RachunekBankowy')
            or platnosc.find(f'.//{{{self.ns}}}RachunekBankowyFaktora')
        )

        rachunek = None
        bank = None
        if rachunek_el is not None and forma not in [1, 2]:
            rachunek_nr = self._get_text(rachunek_el, 'NrRB')
            if rachunek_nr:
                rachunek = self._format_iban(rachunek_nr)
                bank = self._get_text(rachunek_el, 'NazwaBanku')

        return {
            "forma": forma,
            "termin_platnosci": termin_date,
            "rachunek": rachunek,
            "bank": bank,
            "opis": forma_plat_text,
        }

    def _parse_items_fa(self, fa) -> list:
        items = []
        wiersze = fa.findall(f'.//{{{self.ns}}}FaWiersz')
        for wiersz in wiersze:
            items.append(
                {
                    "numer": self._get_text(wiersz, 'NrWierszaFa'),
                    "nazwa": self._get_text(wiersz, 'P_7'),
                    "ilosc": self._get_decimal(wiersz, 'P_8B'),
                    "cena_netto": self._get_decimal(wiersz, 'P_9A'),
                    "wartosc_netto": self._get_decimal(wiersz, 'P_11'),
                    "stawka_vat": self._get_text(wiersz, 'P_12'),
                }
            )
        return items

    def _get_text(
        self, parent, tag: str, default: Optional[str] = None
    ) -> Optional[str]:
        if parent is None:
            return default
        elem = parent.find(f'.//{{{self.ns}}}{tag}')
        if elem is None:
            elem = parent.find(tag)
        return elem.text if elem is not None and elem.text else default

    def _get_decimal(self, parent, tag: str, default: float = 0.0) -> float:
        text = self._get_text(parent, tag)
        if text:
            try:
                return float(text.replace(',', '.'))
            except ValueError:
                return default
        return default

    def _parse_date(self, date_str: Optional[str]) -> Optional[date]:
        if not date_str:
            return None
        try:
            return datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return None

    def _format_iban(self, rachunek: str) -> str:
        rachunek = rachunek.replace(' ', '').replace('-', '')
        if not rachunek.startswith('PL'):
            rachunek = 'PL' + rachunek
        return rachunek

    def _map_forma_platnosci_text(self, text: str) -> int:
        t = text.lower()
        if 'pobranie' in t or 'gotówk' in t or 'gotowk' in t:
            return 1
        if 'kart' in t:
            return 2
        if 'przelew' in t or 'transfer' in t:
            return 6
        if 'czek' in t:
            return 4
        return 8

    def _map_forma_platnosci(self, forma_kod: str) -> int:
        mapping = {
            '1': 1,
            '2': 2,
            '3': 3,
            '4': 4,
            '5': 5,
            '6': 6,
            '7': 7,
            '8': 8,
        }
        return mapping.get(forma_kod, 8)
