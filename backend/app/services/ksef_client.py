import base64
import time
import asyncio
from typing import List, Dict, Optional
from datetime import datetime, timedelta, timezone

import httpx
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.x509 import load_pem_x509_certificate

from .ksef_parser import KsefInvoiceParser
from ..config import settings


class KsefInvoiceSync:
    ENVIRONMENTS = {
        'prod': 'https://api.ksef.mf.gov.pl',
        'demo': 'https://api-test.ksef.mf.gov.pl',
        'test': 'https://api-test.ksef.mf.gov.pl',
    }

    def __init__(self, token: str, environment: str = None):
        # token = dokładnie to, co masz w profilu (np. "data|nip-...|hash")
        self.token = token
        self.environment = environment or getattr(settings, 'KSEF_ENVIRONMENT', 'prod')
        self.base_url = self.ENVIRONMENTS.get(self.environment, self.ENVIRONMENTS['prod'])
        self.session_token: Optional[str] = None
        self.timeout = 60.0

    # ------------------ AUTH ------------------ #

    async def _get_public_key(self, client: httpx.AsyncClient):
        """Pobiera klucz publiczny KSeF do szyfrowania tokena KSeF."""
        r = await client.get(
            f"{self.base_url}/api/v2/security/public-key-certificates",
            headers={'Accept': 'application/json'},
        )
        print(f"[KSeF] PublicKey status: {r.status_code}")
        if r.status_code != 200:
            raise Exception(f"Błąd pobierania klucza publicznego [{r.status_code}]: {r.text[:300]}")

        certs = r.json()
        if not isinstance(certs, list) or not certs:
            raise Exception(f"Nieprawidłowa odpowiedź z public-key-certificates: {certs}")

        enc_cert_pem = None
        for cert_entry in certs:
            usages = cert_entry.get('usage', []) or []
            if 'KsefTokenEncryption' in usages:
                enc_cert_pem = cert_entry.get('certificate')
                break

        if not enc_cert_pem:
            enc_cert_pem = certs[0].get('certificate')

        if not enc_cert_pem:
            raise Exception("Brak certyfikatu szyfrowania w odpowiedzi API")

        if '-----BEGIN' not in enc_cert_pem:
            enc_cert_pem = (
                "-----BEGIN CERTIFICATE-----\n"
                + enc_cert_pem.strip()
                + "\n-----END CERTIFICATE-----\n"
            )

        cert = load_pem_x509_certificate(enc_cert_pem.encode('utf-8'))
        return cert.public_key()

    def _encrypt_token(self, public_key, token: str, timestamp_ms: int) -> str:
        """
        Szyfruje token w formacie 'token|timestampMs' algorytmem RSA-OAEP SHA-256
        i zwraca Base64 (encryptedToken).
        """
        plaintext = f"{token}|{timestamp_ms}".encode('utf-8')
        encrypted = public_key.encrypt(
            plaintext,
            padding.OAEP(
                mgf=padding.MGF1(algorithm=hashes.SHA256()),
                algorithm=hashes.SHA256(),
                label=None,
            ),
        )
        return base64.b64encode(encrypted).decode('utf-8')

    async def create_session(self, nip: str) -> str:
        """Pełny flow: challenge → public key → ksef-token → wait → redeem."""
        if not nip or len(nip) != 10:
            raise ValueError(f"Nieprawidłowy NIP: {nip}")

        headers = {'Content-Type': 'application/json'}

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            # 1. Klucz publiczny
            public_key = await self._get_public_key(client)

            # 2. Challenge
            r1 = await client.post(
                f"{self.base_url}/api/v2/auth/challenge",
                headers=headers,
                json={
                    'contextIdentifier': {
                        'type': 'Nip',
                        'value': nip,
                    }
                },
            )
            print(f"[KSeF] Challenge status: {r1.status_code}")
            print(f"[KSeF] Challenge response: {r1.text[:300]}")

            if r1.status_code not in (200, 201):
                raise Exception(f"Błąd challenge [{r1.status_code}]: {r1.text[:300]}")

            challenge_data = r1.json()
            challenge = challenge_data.get('challenge')
            timestamp_ms = challenge_data.get('timestampMs') or challenge_data.get('timestamp')

            if not challenge:
                raise Exception(f"Brak challenge w odpowiedzi: {challenge_data}")

            if isinstance(timestamp_ms, str) or timestamp_ms is None:
                timestamp_ms = int(time.time() * 1000)

            # 3. Używamy CAŁEGO tokenu z profilu
            raw_token = self.token
            print(f"[KSeF] raw_token used for RSA: {raw_token}")

            # 4. Szyfrowanie tokenu
            encrypted_token = self._encrypt_token(public_key, raw_token, timestamp_ms)

            # 5. ksef-token
            payload_ksef_token = {
                'contextIdentifier': {
                    'type': 'Nip',
                    'value': nip,
                },
                'challenge': challenge,
                'encryptedToken': encrypted_token,
            }
            print("[KSeF] ksef-token REQUEST:", payload_ksef_token)

            r2 = await client.post(
                f"{self.base_url}/api/v2/auth/ksef-token",
                headers=headers,
                json=payload_ksef_token,
            )
            print(f"[KSeF] ksef-token status: {r2.status_code}")
            print(f"[KSeF] ksef-token response: {r2.text[:300]}")

            if r2.status_code not in (200, 201, 202):
                raise Exception(f"Błąd ksef-token [{r2.status_code}]: {r2.text[:300]}")

            r2_data = r2.json()

            auth_obj = r2_data.get('authenticationToken')
            authentication_token = (
                auth_obj.get('token') if isinstance(auth_obj, dict) else auth_obj
            ) if auth_obj else None

            reference_number = r2_data.get('referenceNumber')
            if not reference_number:
                raise Exception(f"Brak referenceNumber: {r2_data}")

            print(f"[KSeF] Czekam na zakończenie uwierzytelniania (referenceNumber: {reference_number})")
            authentication_token = await self._wait_for_auth(
                client, reference_number, authentication_token
            )

            if not authentication_token:
                raise Exception("Brak authenticationToken po zakończonym uwierzytelnianiu")

            # 6. redeem → accessToken
            r3 = await client.post(
                f"{self.base_url}/api/v2/auth/token/redeem",
                headers={
                    'Content-Type': 'application/json',
                    'Authorization': f'Bearer {authentication_token}',
                },
            )
            print(f"[KSeF] redeem status: {r3.status_code}")
            print(f"[KSeF] redeem response: {r3.text[:300]}")

            if r3.status_code not in (200, 201):
                raise Exception(f"Błąd redeem [{r3.status_code}]: {r3.text[:300]}")

            r3_data = r3.json()
            access_token_obj = r3_data.get('accessToken')
            if isinstance(access_token_obj, dict):
                self.session_token = access_token_obj.get('token')
            else:
                self.session_token = access_token_obj

            if not self.session_token:
                raise Exception(f"Brak accessToken: {r3_data}")

            print(f"[KSeF] Sesja OK: {self.session_token[:20]}...")
            return self.session_token

    async def _wait_for_auth(
        self,
        client: httpx.AsyncClient,
        reference_number: str,
        authentication_token: Optional[str],
        max_attempts: int = 20,
        delay: float = 3.0,
    ) -> str:
        """Czeka aż status.code == 200 na GET /auth/{referenceNumber}."""
        for attempt in range(max_attempts):
            headers = {'Accept': 'application/json'}
            if authentication_token:
                headers['Authorization'] = f'Bearer {authentication_token}'

            r = await client.get(
                f"{self.base_url}/api/v2/auth/{reference_number}",
                headers=headers,
            )
            print(f"[KSeF] Auth status check [{attempt + 1}]: {r.status_code} {r.text[:300]}")

            if r.status_code == 200:
                data = r.json()
                status_field = data.get('status')
                if isinstance(status_field, dict):
                    status_code = status_field.get('code')
                else:
                    status_code = data.get('statusCode') or status_field

                print(f"[KSeF] Status uwierzytelniania: {status_code}")

                if status_code == 200:
                    auth_obj = data.get('authenticationToken')
                    if auth_obj:
                        return auth_obj.get('token') if isinstance(auth_obj, dict) else auth_obj
                    if authentication_token:
                        return authentication_token
                    raise Exception("Brak authenticationToken po statusie 200")

                if status_code in (100, 450):
                    if status_code == 450:
                        raise Exception(
                            f"Uwierzytelnianie zakończone niepowodzeniem (status 450, błędny token KSeF). "
                            f"Sprawdź token KSeF i NIP."
                        )
                    await asyncio.sleep(delay)
                    continue

                raise Exception(f"Nieoczekiwany status uwierzytelniania: {status_code}, dane: {data}")

            await asyncio.sleep(delay)

        raise Exception(f"Timeout oczekiwania na status 200 (referenceNumber: {reference_number})")

    async def terminate_session(self):
        """Zamyka sesję w KSeF (DELETE /auth/token)."""
        if not self.session_token:
            return

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                r = await client.delete(
                    f"{self.base_url}/api/v2/auth/token",
                    headers={'Authorization': f'Bearer {self.session_token}'},
                )
                print(f"[KSeF] terminate_session status: {r.status_code}")
        except Exception as e:
            print(f"[KSeF] terminate_session error: {e}")

        self.session_token = None

    # ------------------ INVOICES – /api/v2/invoices/query ------------------ #

    async def sync_invoices(
        self,
        nip_nabywcy: str,
        date_from: datetime = None,
        date_to: datetime = None,
    ) -> List[Dict]:
        """Pobiera i parsuje faktury z KSeF dla podanego NIP nabywcy w zadanym przedziale."""
        now_utc = datetime.now(timezone.utc)
        if not date_from:
            date_from = now_utc - timedelta(days=30)
        if not date_to:
            date_to = now_utc

        await self.create_session(nip=nip_nabywcy)

        try:
            invoice_refs = await self._query_invoices_legacy(nip_nabywcy, date_from, date_to)
            faktury: List[Dict] = []

            for ref in invoice_refs:
                ksef_number = (
                    ref.get('ksefReferenceNumber')
                    or ref.get('referenceNumber')
                    or ref.get('ksefNumber')
                )
                if not ksef_number:
                    continue

                xml_content = await self.get_invoice(ksef_number)
                if not xml_content:
                    continue

                try:
                    parser = KsefInvoiceParser(xml_content)
                    invoice_data = parser.parse()
                    invoice_data['numer_ksef'] = ksef_number
                    invoice_data['xml_original'] = xml_content
                    invoice_data['data_otrzymania'] = now_utc
                    faktury.append(invoice_data)
                except Exception as e:
                    print(f"[KSeF] Błąd parsowania {ksef_number}: {e}")

            return faktury

        finally:
            await self.terminate_session()

    async def _query_invoices_legacy(
        self,
        nip_nabywcy: str,
        date_from: datetime,
        date_to: datetime,
    ) -> List[Dict]:
        """
        Stare endpointy KSeF 2.0: POST /api/v2/invoices/query
        """
        if not self.session_token:
            raise RuntimeError("Brak aktywnej sesji KSeF")

        headers = {
            'Authorization': f'Bearer {self.session_token}',
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        }

        if date_from.tzinfo is None:
            date_from = date_from.replace(tzinfo=timezone.utc)
        if date_to.tzinfo is None:
            date_to = date_to.replace(tzinfo=timezone.utc)

        payload = {
            "queryCriteria": {
                "subjectType": "subject2",  # nabywca
                "type": "incremental",
                "acquisitionTimestampThreshold": {
                    "from": date_from.strftime('%Y-%m-%dT%H:%M:%S.000Z'),
                    "to": date_to.strftime('%Y-%m-%dT%H:%M:%S.000Z'),
                },
            }
        }

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(
                f"{self.base_url}/api/v2/invoices/query",
                headers=headers,
                json=payload,
            )
            print(f"[KSeF] Query status: {response.status_code}")
            print(f"[KSeF] Query response: {response.text[:500]}")

            if response.status_code == 200:
                data = response.json()
                return (
                    data.get("invoiceHeaderList")
                    or data.get("invoices")
                    or data.get("invoiceList")
                    or []
                )
            elif response.status_code == 404:
                raise Exception(
                    "Endpoint /api/v2/invoices/query (stare zapytania) niedostępny (404) "
                    "dla tego tokenu/środowiska – sprawdź specyfikację KSeF lub przełącz się na nowe flow Query Init/Status/Download."
                )
            else:
                raise Exception(f"Błąd query [{response.status_code}]: {response.text[:500]}")

    async def get_invoice(self, ksef_number: str) -> Optional[str]:
        """Pobiera pojedynczą fakturę XML po numerze KSeF."""
        if not self.session_token:
            raise RuntimeError("Brak aktywnej sesji KSeF")

        headers = {
            'Authorization': f'Bearer {self.session_token}',
            'Accept': 'application/octet-stream',
        }

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.get(
                f"{self.base_url}/api/v2/invoices/{ksef_number}",
                headers=headers,
            )
            print(f"[KSeF] get_invoice {ksef_number} status: {response.status_code}")

            if response.status_code != 200:
                print(f"[KSeF] Błąd pobierania {ksef_number}: [{response.status_code}] {response.text[:300]}")
                return None

            content_type = response.headers.get('content-type', '')
            if 'application/json' in content_type:
                body = response.json()
                xml_b64 = body.get('invoiceData', '')
                if xml_b64:
                    return base64.b64decode(xml_b64).decode('utf-8')
                return None

            return response.text
