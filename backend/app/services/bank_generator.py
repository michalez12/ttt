from lxml import etree
from datetime import datetime, date
from typing import List, Dict, Any
from decimal import Decimal


class BankXMLGenerator:
    """Generator plików XML w formacie pain.001.001.09 dla Banku Pekao."""

    def __init__(self, firma_data: Dict[str, Any]):
        self.firma = firma_data
        self.ns = "urn:iso:std:iso:20022:tech:xsd:pain.001.001.09"

    def generate(
        self, faktury: List[Dict[str, Any]], message_id: str | None = None
    ) -> str:
        if not faktury:
            raise ValueError("Brak faktur do wygenerowania XML")

        if not message_id:
            message_id = f"MSG{datetime.now().strftime('%Y%m%d%H%M%S')}"

        liczba_platnosci = len(faktury)
        suma_platnosci = sum(
            Decimal(str(f["kwota_brutto"])) for f in faktury
        )

        root = etree.Element(
            f"{{{self.ns}}}Document",
            nsmap={None: self.ns},
        )
        cstmr = etree.SubElement(root, "CstmrCdtTrfInitn")

        self._create_group_header(
            cstmr, message_id, liczba_platnosci, suma_platnosci
        )
        self._create_payment_info(cstmr, faktury, suma_platnosci)

        xml_string = etree.tostring(
            root,
            pretty_print=True,
            xml_declaration=True,
            encoding="UTF-8",
        ).decode("utf-8")

        return xml_string

    def _create_group_header(
        self, parent, msg_id: str, nb_of_txs: int, ctrl_sum: Decimal
    ):
        grp_hdr = etree.SubElement(parent, "GrpHdr")
        etree.SubElement(grp_hdr, "MsgId").text = msg_id
        etree.SubElement(grp_hdr, "CreDtTm").text = datetime.now().strftime(
            "%Y-%m-%dT%H:%M:%S"
        )
        etree.SubElement(grp_hdr, "NbOfTxs").text = str(nb_of_txs)
        etree.SubElement(grp_hdr, "CtrlSum").text = f"{ctrl_sum:.2f}"
        init_pty = etree.SubElement(grp_hdr, "InitgPty")
        etree.SubElement(init_pty, "Nm").text = self.firma.get("nazwa") or ""
        return grp_hdr

    def _create_payment_info(
        self, parent, faktury: List[Dict[str, Any]], ctrl_sum: Decimal
    ):
        pmt_inf = etree.SubElement(parent, "PmtInf")
        etree.SubElement(pmt_inf, "PmtInfId").text = (
            f"PMT{datetime.now().strftime('%Y%m%d%H%M%S')}"
        )
        etree.SubElement(pmt_inf, "PmtMtd").text = "TRF"
        etree.SubElement(pmt_inf, "BtchBookg").text = "true"
        etree.SubElement(pmt_inf, "NbOfTxs").text = str(len(faktury))
        etree.SubElement(pmt_inf, "CtrlSum").text = f"{ctrl_sum:.2f}"

        # Typ płatności – zwykły przelew
        pmt_tp_inf = etree.SubElement(pmt_inf, "PmtTpInf")
        svc_lvl = etree.SubElement(pmt_tp_inf, "SvcLvl")
        etree.SubElement(svc_lvl, "Cd").text = "TRF"

        # Data wykonania – najwcześniejszy termin płatności lub dziś
        dates = [
            f["termin_platnosci"]
            for f in faktury
            if isinstance(f.get("termin_platnosci"), date)
        ]
        req_date = min(dates) if dates else datetime.now().date()
        reqd_exctn_dt = etree.SubElement(pmt_inf, "ReqdExctnDt")
        etree.SubElement(reqd_exctn_dt, "Dt").text = req_date.strftime("%Y-%m-%d")

        # Debtor
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

        # Każda faktura = jeden CdtTrfTxInf
        for idx, faktura in enumerate(faktury, 1):
            self._create_credit_transfer(pmt_inf, faktura, idx)

        return pmt_inf

    def _create_credit_transfer(
        self, parent, faktura: Dict[str, Any], idx: int
    ):
        is_mpp = faktura.get("is_mpp", False)

        cdt_trf = etree.SubElement(parent, "CdtTrfTxInf")

        # Payment ID
        pmt_id = etree.SubElement(cdt_trf, "PmtId")
        etree.SubElement(pmt_id, "InstrId").text = f"TXN{idx:04d}"
        end_to_end = (faktura.get("numer_faktury") or "").strip()
        if len(end_to_end) > 16:
            end_to_end = end_to_end[:16]
        etree.SubElement(pmt_id, "EndToEndId").text = end_to_end

        # Dla MPP: dodaj CtgyPurp = VATX na poziomie CdtTrfTxInf
        # zgodnie ze specyfikacją Pekao sekcja 4.5
        if is_mpp:
            pmt_tp_inf = etree.SubElement(cdt_trf, "PmtTpInf")
            ctgy_purp = etree.SubElement(pmt_tp_inf, "CtgyPurp")
            etree.SubElement(ctgy_purp, "Cd").text = "VATX"

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

        # Remittance – tytuł przelewu
        rmt_inf = etree.SubElement(cdt_trf, "RmtInf")

        if is_mpp:
            # Format MPP wg specyfikacji Pekao sekcja 4.5:
            # /VAT/kwota_VAT/IDC/nip_kontrahenta/INV/numer_faktury/TXT/opis
            kwota_vat = Decimal(str(faktura.get("kwota_vat", 0)))
            nip = (faktura.get("kontrahent_nip") or "").replace(" ", "")
            numer = (faktura.get("numer_faktury") or "").strip()

            tytul = (
                f"/VAT/{kwota_vat:.2f}"
                f"/IDC/{nip}"
                f"/INV/{numer}"
                f"/TXT/Platnosc podzielona"
            )

            # Maksymalnie 140 znaków wg specyfikacji
            if len(tytul) > 140:
                tytul = tytul[:140]

            etree.SubElement(rmt_inf, "Ustrd").text = tytul
        else:
            # Zwykły przelew – standardowy tytuł
            etree.SubElement(rmt_inf, "Ustrd").text = (
                f"Faktura {faktura['numer_faktury']}"
            )

        return cdt_trf
