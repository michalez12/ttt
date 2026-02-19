import httpx
from datetime import date
from typing import Literal

BIALA_LISTA_URL = "https://wl-api.mf.gov.pl/api/search/nip/{nip}"


StatusTyp = Literal["ZWERYFIKOWANY", "NIEZWERYFIKOWANY", "PENDING", "BLAD"]


class WhiteListClient:
    """
    Prosty klient Białej Listy MF:
    - sprawdza czy rachunek jest na białej liście dla danego NIP i daty.
    """

    async def verify_account(
        self,
        nip: str,
        iban: str,
        check_date: date | None = None,
    ) -> tuple[StatusTyp, str | None]:
        """
        Zwraca (status, komunikat_bledu)

        status:
          - 'ZWERYFIKOWANY'     – rachunek jest na białej liście
          - 'NIEZWERYFIKOWANY'  – rachunku brak w danych MF
          - 'PENDING'           – nie sprawdzono (np. brak danych)
          - 'BLAD'              – błąd techniczny / HTTP
        """
        if not nip or not iban:
            return "PENDING", "Brak NIP lub IBAN"

        if check_date is None:
            check_date = date.today()

        params = {
            "bankAccount": iban,
            "date": check_date.strftime("%Y-%m-%d"),
        }

        url = BIALA_LISTA_URL.format(nip=nip)

        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                resp = await client.get(url, params=params)
            except Exception as e:
                return "BLAD", f"Błąd połączenia z API MF: {e}"

        if resp.status_code != 200:
            return "BLAD", f"HTTP {resp.status_code} z API MF"

        data = resp.json()

        # typowa odpowiedź MF: result.subjects[0].accountNumbers
        try:
            result = data.get("result") or {}
            subjects = result.get("subjects") or []
            if not subjects:
                return "NIEZWERYFIKOWANY", "Brak podmiotu w odpowiedzi MF"

            subject = subjects[0]
            accounts = subject.get("accountNumbers") or []

            if iban in accounts:
                return "ZWERYFIKOWANY", None
            else:
                return "NIEZWERYFIKOWANY", "Rachunek nie widnieje na białej liście MF"
        except Exception as e:
            return "BLAD", f"Nieoczekiwana struktura odpowiedzi MF: {e}"
