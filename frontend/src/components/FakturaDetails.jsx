import { X } from 'lucide-react';
import { format } from 'date-fns';

export default function FakturaDetails({ faktura, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold">Szczegóły faktury</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">
                Numer faktury
              </label>
              <p className="mt-1 text-lg">{faktura.numer_faktury}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Numer KSeF
              </label>
              <p className="mt-1 text-sm text-gray-700">{faktura.numer_ksef || '-'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">
                Data wystawienia
              </label>
              <p className="mt-1">
                {faktura.data_wystawienia ? format(new Date(faktura.data_wystawienia), 'dd.MM.yyyy') : '-'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Termin płatności
              </label>
              <p className="mt-1">
                {faktura.termin_platnosci ? format(new Date(faktura.termin_platnosci), 'dd.MM.yyyy') : '-'}
              </p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">
              Kontrahent
            </label>
            <p className="mt-1 text-lg">{faktura.kontrahent?.nazwa || 'Brak'}</p>
            <p className="text-sm text-gray-600">NIP: {faktura.kontrahent?.nip || '-'}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">
              Rachunek bankowy
            </label>
            <p className="mt-1">{faktura.rachunek?.iban || 'Brak'}</p>
            {faktura.rachunek?.nazwa_banku && (
              <p className="text-sm text-gray-600">{faktura.rachunek.nazwa_banku}</p>
            )}
            {faktura.rachunek?.status_biala_lista && (
              <p className="text-sm mt-1">
                Status Białej Listy: 
                <span className={`ml-2 ${faktura.rachunek.status_biala_lista === 'ZWERYFIKOWANY' ? 'text-green-600' : 'text-orange-600'}`}>
                  {faktura.rachunek.status_biala_lista}
                </span>
              </p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4 border-t pt-4">
            <div>
              <label className="text-sm font-medium text-gray-500">
                Kwota netto
              </label>
              <p className="mt-1 text-lg">
                {parseFloat(faktura.kwota_netto).toFixed(2)} {faktura.waluta}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                VAT
              </label>
              <p className="mt-1 text-lg">
                {parseFloat(faktura.kwota_vat).toFixed(2)} {faktura.waluta}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Kwota brutto
              </label>
              <p className="mt-1 text-lg font-bold text-blue-600">
                {parseFloat(faktura.kwota_brutto).toFixed(2)} {faktura.waluta}
              </p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">
              Forma płatności
            </label>
            <p className="mt-1">
              {faktura.forma_platnosci === '6' ? 'Przelew' : 
               faktura.forma_platnosci === '1' ? 'Gotówka' :
               faktura.forma_platnosci === '2' ? 'Karta' : 
               'Inna'}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">
              Status
            </label>
            <p className="mt-1">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                faktura.status === 'NOWA' ? 'bg-blue-100 text-blue-800' :
                faktura.status === 'WYEKSPORTOWANA' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {faktura.status}
              </span>
            </p>
          </div>
        </div>

        <div className="p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Zamknij
          </button>
        </div>
      </div>
    </div>
  );
}
