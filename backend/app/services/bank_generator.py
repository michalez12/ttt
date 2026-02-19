from lxml import etree
from datetime import datetime, date
from typing import List, Dict, Any
from decimal import Decimal


class BankXMLGenerator:
    """Generator plików XML w formacie pain.001.001.09 dla Banku Pekao (zwykłe przelewy Elixir)."""

    def __init__(self, firma_data: Dict[str, Any]):
        """
        firma_data:
            {
                'nazwa': str,
                'nip': str | None,
                'rachunek': str,  # IBAN nadawcy
                'bic': str | None (opcjonalnie)
            }
        """
        self.firma = firma_data
        self.ns = "urn:iso:std:iso:20022:tech:xsd:pain.001.001.09"

    def generate(self, faktury: List[Dict[str, Any]], message_id: str | None = None) -> str:
        """
        faktury: lista słowników:
            {
                'numer_ksef': str | None,
                'numer_faktury': str,
                'kontrahent_nazwa': str,
                'kontrahent_nip': str,
                'rachunek_iban': str,
                'nazwa_banku': str | None,
                'kwota_brutto': float | Decimal,
                'waluta': str,              # oczekujemy 'PLN'
                'termin_platnosci': date | None,
            }
        """
        if not faktury:
            raise ValueError("Brak faktur do wygenerowania XML")

        if not message_id:
            message_id = f"MSG{datetime.now().strftime('%Y%m%d%H%M%S')}"

        liczba_platnosci = len(faktury)
        suma_platnosci = sum(Decimal(str(f["kwota_brutto"])) for f in faktury)

        # Root z poprawnym namespace (jeden xmlns)
        root = etree.Element(
            f"{{{self.ns}}}Document",
            nsmap={None: self.ns},
        )
        cstmr = etree.SubElement(root, "CstmrCdtTrfInitn")

        # GrpHdr
        self._create_group_header(cstmr, message_id, liczba_platnosci, suma_platnosci)

        # PmtInf
        self._create_payment_info(cstmr, faktury, suma_platnosci)

        xml_string = etree.tostring(
            root,
            pretty_print=True,
            xml_declaration=True,
            encoding="UTF-8",
        ).decode("utf-8")
        return xml_string

    def _create_group_header(self, parent, msg_id: str, nb_of_txs: int, ctrl_sum: Decimal):
        grp_hdr = etree.SubElement(parent, "GrpHdr")
        etree.SubElement(grp_hdr, "MsgId").text = msg_id
        etree.SubElement(grp_hdr, "CreDtTm").text = datetime.now().strftime("%Y-%m-%dT%H%M%S")
        etree.SubElement(grp_hdr, "NbOfTxs").text = str(nb_of_txs)
        etree.SubElement(grp_hdr, "CtrlSum").text = f"{ctrl_sum:.2f}"

        # InitgPty – TYLKO nazwa, bez sekcji <Id> (tak jak w działającym XML-u)
        init_pty = etree.SubElement(grp_hdr, "InitgPty")
        etree.SubElement(init_pty, "Nm").text = self.firma.get("nazwa") or ""

        return grp_hdr

    def _create_payment_info(self, parent, faktury: List[Dict[str, Any]], ctrl_sum: Decimal):
        pmt_inf = etree.SubElement(parent, "PmtInf")

        etree.SubElement(pmt_inf, "PmtInfId").text = f"PMT{datetime.now().strftime('%Y%m%d%H%M%S')}"
        etree.SubElement(pmt_inf, "PmtMtd").text = "TRF"
        etree.SubElement(pmt_inf, "BtchBookg").text = "true"
        etree.SubElement(pmt_inf, "NbOfTxs").text = str(len(faktury))
        etree.SubElement(pmt_inf, "CtrlSum").text = f"{ctrl_sum:.2f}"

        # Typ płatności – zwykły przelew (TRF)
        pmt_tp_inf = etree.SubElement(pmt_inf, "PmtTpInf")
        svc_lvl = etree.SubElement(pmt_tp_inf, "SvcLvl")
        etree.SubElement(svc_lvl, "Cd").text = "TRF"

        # Data wykonania – minimalny termin płatności lub dziś,
        # w formacie <ReqdExctnDt><Dt>rrrr-mm-dd</Dt></ReqdExctnDt>
        dates = [f["termin_platnosci"] for f in faktury if isinstance(f.get("termin_platnosci"), date)]
        if dates:
            req_date = min(dates)
        else:
            req_date = datetime.now().date()

        reqd_exctn_dt = etree.SubElement(pmt_inf, "ReqdExctnDt")
        etree.SubElement(reqd_exctn_dt, "Dt").text = req_date.strftime("%Y-%m-%d")

        # Debtor – TYLKO nazwa, bez sekcji <Id>
        dbtr = etree.SubElement(pmt_inf, "Dbtr")
        etree.SubElement(dbtr, "Nm").text = self.firma.get("nazwa") or ""

        # Debtor Account
        dbtr_acct = etree.SubElement(pmt_inf, "DbtrAcct")
        dbtr_id = etree.SubElement(dbtr_acct, "Id")
        etree.SubElement(dbtr_id, "IBAN").text = self.firma["rachunek"]

        # Debtor Agent
        dbtr_agt = etree.SubElement(pmt_inf, "DbtrAgt")
        fin_instn_id = etree.SubElement(dbtr_agt, "FinInstnId")
        bic = self.firma.get("bic")
        if bic:
            etree.SubElement(fin_instn_id, "BIC").text = bic
        # jeśli brak BIC – Pekao akceptuje puste FinInstnId

        # Każda faktura = jeden CdtTrfTxInf
        for idx, faktura in enumerate(faktury, 1):
            self._create_credit_transfer(pmt_inf, faktura, idx)

        return pmt_inf

    def _create_credit_transfer(self, parent, faktura: Dict[str, Any], idx: int):
        cdt_trf = etree.SubElement(parent, "CdtTrfTxInf")

        # Payment ID
        pmt_id = etree.SubElement(cdt_trf, "PmtId")
        etree.SubElement(pmt_id, "InstrId").text = f"TXN{idx:04d}"

        end_to_end = (faktura.get("numer_faktury") or "").strip()
        if len(end_to_end) > 16:
            end_to_end = end_to_end[:16]
        etree.SubElement(pmt_id, "EndToEndId").text = end_to_end

        # Amount
        amt = etree.SubElement(cdt_trf, "Amt")
        waluta = faktura.get("waluta") or "PLN"
        instd_amt = etree.SubElement(amt, "InstdAmt", Ccy=waluta)
        instd_amt.text = f"{Decimal(str(faktura['kwota_brutto'])):.2f}"

        # Creditor (kontrahent)
        cdtr = etree.SubElement(cdt_trf, "Cdtr")
        etree.SubElement(cdtr, "Nm").text = faktura["kontrahent_nazwa"]

        # Creditor Account
        cdtr_acct = etree.SubElement(cdt_trf, "CdtrAcct")
        cdtr_id = etree.SubElement(cdtr_acct, "Id")
        etree.SubElement(cdtr_id, "IBAN").text = faktura["rachunek_iban"]

        # Remittance (tytuł przelewu)
        rmt_inf = etree.SubElement(cdt_trf, "RmtInf")
        etree.SubElement(rmt_inf, "Ustrd").text = f"Faktura {faktura['numer_faktury']}"

        return cdt_trf
