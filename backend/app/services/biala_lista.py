import httpx
from typing import Dict, Optional
from datetime import datetime, timedelta
from ..config import settings

class BialaListaVerifier:
    """Weryfikator rachunków bankowych w Białej Liście VAT MF"""
    
    def __init__(self):
        self.base_url = settings.MF_API_URL
        self.timeout = 10.0
    
    async def verify_account(
        self, 
        nip: str, 
        account: str, 
        date: Optional[str] = None
    ) -> Dict:
        """
        Weryfikacja rachunku bankowego w Białej Liście VAT
        
        Args:
            nip: NIP kontrahenta (10 cyfr)
            account: Numer rachunku bankowego (26 cyfr bez PL)
            date: Data weryfikacji w formacie YYYY-MM-DD (domyślnie dziś)
            
        Returns:
            Dict z wynikiem weryfikacji
        """
        if not date:
            date = datetime.now().strftime('%Y-%m-%d')
        
        # Normalizacja
        nip = nip.replace('-', '').replace(' ', '')
        account = account.replace('PL', '').replace(' ', '').replace('-', '')
        
        url = f"{self.base_url}/check/nip/{nip}/bank-account/{account}"
        params = {"date": date}
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(url, params=params)
                
                if response.status_code == 200:
                    data = response.json()
                    result = data.get('result', {})
                    
                    account_assigned = result.get('accountAssigned', 'NIE')
                    
                    return {
                        'status': 'ZWERYFIKOWANY' if account_assigned == 'TAK' else 'NIEZNALEZIONY',
                        'verified': True,
                        'account_assigned': account_assigned == 'TAK',
                        'request_id': result.get('requestId'),
                        'request_datetime': result.get('requestDateTime'),
                        'verified_at': datetime.now(),
                        'valid_until': datetime.now() + timedelta(days=30),
                        'error': None
                    }
                elif response.status_code == 400:
                    return {
                        'status': 'BLAD_DANYCH',
                        'verified': False,
                        'account_assigned': False,
                        'error': 'Nieprawidłowe dane wejściowe (NIP lub rachunek)'
                    }
                elif response.status_code == 404:
                    return {
                        'status': 'NIEZNALEZIONY',
                        'verified': True,
                        'account_assigned': False,
                        'error': 'Podmiot nie został znaleziony w rejestrze'
                    }
                else:
                    return {
                        'status': 'BLAD_API',
                        'verified': False,
                        'account_assigned': False,
                        'error': f'API returned status {response.status_code}'
                    }
                    
        except httpx.TimeoutException:
            return {
                'status': 'TIMEOUT',
                'verified': False,
                'account_assigned': False,
                'error': 'Przekroczono limit czasu połączenia z API MF'
            }
        except Exception as e:
            return {
                'status': 'BLAD_POLACZENIA',
                'verified': False,
                'account_assigned': False,
                'error': str(e)
            }
    
    async def get_subject_info(self, nip: str, date: Optional[str] = None) -> Dict:
        """
        Pobiera pełne informacje o podmiocie z Białej Listy VAT
        
        Args:
            nip: NIP podmiotu
            date: Data sprawdzenia (domyślnie dziś)
            
        Returns:
            Dict z danymi podmiotu
        """
        if not date:
            date = datetime.now().strftime('%Y-%m-%d')
        
        nip = nip.replace('-', '').replace(' ', '')
        url = f"{self.base_url}/search/nip/{nip}"
        params = {"date": date}
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(url, params=params)
                
                if response.status_code == 200:
                    data = response.json()
                    subject = data.get('result', {}).get('subject', {})
                    
                    return {
                        'found': True,
                        'nip': subject.get('nip'),
                        'nazwa': subject.get('name'),
                        'status_vat': subject.get('statusVat'),
                        'regon': subject.get('regon'),
                        'pesel': subject.get('pesel'),
                        'krs': subject.get('krs'),
                        'adres': subject.get('residenceAddress'),
                        'adres_koresp': subject.get('workingAddress'),
                        'rachunki': subject.get('accountNumbers', []),
                        'error': None
                    }
                else:
                    return {
                        'found': False,
                        'error': f'Podmiot nie znaleziony (status {response.status_code})'
                    }
                    
        except Exception as e:
            return {
                'found': False,
                'error': str(e)
            }
