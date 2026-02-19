from datetime import date, timedelta

class PaymentClassifier:
    """Klasyfikuje płatności i przypisuje kolory"""
    
    @staticmethod
    def classify(forma_platnosci: int, czy_opozniona: bool = False) -> dict:
        """
        Klasyfikuje płatność i zwraca kolor oraz czy eksportować
        
        Formy płatności (KSeF):
        1 = Gotówka/pobranie
        2 = Karta
        3 = Bon
        4 = Czek
        5 = Kredyt
        6 = Przelew
        7 = Potrącenie
        8 = Kompensata/Inna
        
        Kolory:
        - green: zapłacone gotówką/kartą (bez opóźnienia)
        - orange: gotówka/karta z opóźnieniem LUB przelew zaległy
        - yellow: przelew do zapłaty (w terminie)
        - red: przelew po terminie (zaległy)
        - gray: inne formy płatności
        """
        
        if forma_platnosci == 6:
            if czy_opozniona:
                return {"color": "red", "export": True}
            else:
                return {"color": "yellow", "export": True}
        
        elif forma_platnosci in [1, 2]:
            if czy_opozniona:
                return {"color": "orange", "export": False}
            else:
                return {"color": "green", "export": False}
        
        elif forma_platnosci == 4:
            if czy_opozniona:
                return {"color": "orange", "export": False}
            else:
                return {"color": "yellow", "export": False}
        
        elif forma_platnosci in [7, 8]:
            return {"color": "gray", "export": False}
        
        else:
            return {"color": "gray", "export": False}
    
    @staticmethod
    def classify_korekta(kwota_brutto: float, czy_opozniona: bool = False) -> dict:
        """Klasyfikuje korekty"""
        if kwota_brutto < 0:
            return {"color": "blue", "export": False, "type": "korekta_ujemna"}
        else:
            if czy_opozniona:
                return {"color": "red", "export": True, "type": "korekta_dodatnia"}
            else:
                return {"color": "purple", "export": True, "type": "korekta_dodatnia"}
    
    @staticmethod
    def check_payment_status(termin_platnosci: date) -> dict:
        """Sprawdza status płatności na podstawie terminu"""
        if not termin_platnosci:
            return {"status": "UNKNOWN", "overdue": False}
        
        today = date.today()
        days_diff = (termin_platnosci - today).days
        
        if days_diff < 0:
            return {"status": "OVERDUE", "overdue": True, "days": abs(days_diff)}
        elif days_diff <= 7:
            return {"status": "DUE_SOON", "overdue": False, "days": days_diff}
        else:
            return {"status": "FUTURE", "overdue": False, "days": days_diff}
    
    @staticmethod
    def get_color_description(color: str) -> str:
        """Zwraca opis koloru"""
        descriptions = {
            "green": "Zapłacone gotówką/kartą",
            "yellow": "Przelew do zapłaty",
            "orange": "Wymaga uwagi",
            "red": "Po terminie!",
            "blue": "Korekta ujemna",
            "purple": "Korekta dodatnia",
            "gray": "Inna forma płatności"
        }
        return descriptions.get(color, "Nieznany status")
