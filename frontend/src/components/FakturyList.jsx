import { useState, useEffect } from 'react';
import { getFaktury, verifyFaktura, generateExport, downloadExport, uploadFakturaXML, updateFakturaStatus } from '../services/api';
import { CheckCircle, XCircle, Clock, Download, FileCheck, Upload, Filter, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import FakturaDetails from './FakturaDetails';
import toast, { Toaster } from 'react-hot-toast';

export default function FakturyList() {
  const [faktury, setFaktury] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [detailsModal, setDetailsModal] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  // Filtry
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSearch, setFilterSearch] = useState('');
  const [sortYear, setSortYear] = useState('');
  const [sortMonth, setSortMonth] = useState('');

  useEffect(() => {
    loadFaktury();
  }, []);

  const loadFaktury = async () => {
    try {
      const data = await getFaktury();
      setFaktury(data.items || []);
    } catch (error) {
      console.error('Błąd ładowania faktur:', error);
      toast.error('Błąd ładowania faktur');
    } finally {
      setLoading(false);
    }
  };
const handleKsefSync = async () => {
  try {
    toast.loading('Pobieranie faktur z KSeF...');
    const response = await api.post('/api/ksef/sync');
    toast.dismiss();
    toast.success(`Pobrano ${response.data.nowe_faktury} nowych faktur!`);
    loadFaktury();
  } catch (error) {
    toast.dismiss();
    toast.error('Błąd synchronizacji: ' + (error.response?.data?.detail || error.message));
  }
};


  const handleUpload = async () => {
    if (!uploadFile) {
      toast.error('Wybierz plik XML');
      return;
    }

    setUploading(true);
    try {
      await uploadFakturaXML(uploadFile);
      toast.success('Faktura zaimportowana!');
      setUploadFile(null);
      document.getElementById('file-upload').value = '';
      loadFaktury();
    } catch (error) {
      toast.error('Błąd importu: ' + (error.response?.data?.detail || error.message));
    } finally {
      setUploading(false);
    }
  };

  const handleVerify = async (id) => {
    try {
      await verifyFaktura(id);
      toast.success('Rachunek zweryfikowany!');
      loadFaktury();
    } catch (error) {
      toast.error('Błąd weryfikacji');
    }
  };

  const handleMarkPaid = async (id) => {
    try {
      await updateFakturaStatus(id, 'ZAPLACONA');
      toast.success('Faktura oznaczona jako zapłacona');
      loadFaktury();
    } catch (error) {
      toast.error('Błąd aktualizacji statusu');
    }
  };

  const handleRevert = async (id, previousStatus) => {
    const confirmed = window.confirm('Czy na pewno chcesz cofnąć status tej faktury do NOWA?');
    if (!confirmed) return;

    const newStatus = previousStatus || 'NOWA';
    try {
      await updateFakturaStatus(id, newStatus);
      toast.success(`Status zmieniony na ${newStatus}`);
      loadFaktury();
    } catch (error) {
      toast.error('Błąd cofania statusu');
    }
  };

  const handleExport = async () => {
    if (selected.length === 0) {
      toast.error('Wybierz co najmniej jedną fakturę');
      return;
    }

    setExporting(true);
    try {
      const result = await generateExport(selected);
      toast.success(`XML wygenerowany: ${result.nazwa_pliku}`);
      
      const blob = await downloadExport(result.eksport_id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.nazwa_pliku;
      a.click();
      
      setSelected([]);
      loadFaktury();
    } catch (error) {
      toast.error('Błąd eksportu: ' + (error.response?.data?.detail?.message || error.message));
    } finally {
      setExporting(false);
    }
  };

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selected.length === filteredFaktury.length) {
      setSelected([]);
    } else {
      setSelected(filteredFaktury.map((f) => f.id));
    }
  };

  const getTerminColor = (termin, status, forma_platnosci) => {
    // Jeśli zapłacona - szary
    if (status === 'ZAPLACONA') return 'text-gray-500';
    
    // Jeśli gotówka/karta - nie pokazuj czerwieni (płatność natychmiastowa)
    if (forma_platnosci === '1' || forma_platnosci === '2') return 'text-gray-500';
    
    // Tylko dla nowych faktur z przelewem
    if (status !== 'NOWA') return 'text-gray-500';
    if (!termin) return 'text-gray-500';
    
    const today = new Date();
    const terminDate = new Date(termin);
    const diffDays = Math.ceil((terminDate - today) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'text-red-600 font-bold'; // Przeterminowane
    if (diffDays <= 3) return 'text-orange-600 font-semibold'; // 3 dni
    if (diffDays <= 7) return 'text-yellow-600'; // Tydzień
    return 'text-green-600'; // OK
  };

  const getStatusBadge = (status) => {
    const styles = {
      NOWA: 'bg-blue-100 text-blue-800 border border-blue-200',
      WYEKSPORTOWANA: 'bg-green-100 text-green-800 border border-green-200',
      ZAPLACONA: 'bg-purple-100 text-purple-800 border border-purple-200',
    };
    return (
      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  const getFormaPlatnosci = (kod) => {
    const formy = {
      '1': { label: 'Gotówka', color: 'bg-gray-100 text-gray-800', emoji: '💵' },
      '2': { label: 'Karta', color: 'bg-blue-100 text-blue-800', emoji: '💳' },
      '6': { label: 'Przelew', color: 'bg-indigo-100 text-indigo-800', emoji: '🏦' },
      '4': { label: 'Czek', color: 'bg-yellow-100 text-yellow-800', emoji: '📝' },
      '8': { label: 'Inna', color: 'bg-gray-100 text-gray-800', emoji: '❓' },
    };
    const forma = formy[kod] || { label: 'Nieznana', color: 'bg-gray-100 text-gray-800', emoji: '❓' };
    return (
      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${forma.color} whitespace-nowrap`}>
        {forma.emoji} {forma.label}
      </span>
    );
  };

  // Filtrowanie - JEDNA definicja
  const filteredFaktury = faktury.filter(f => {
    if (filterStatus && f.status !== filterStatus) return false;
    if (filterSearch) {
      const search = filterSearch.toLowerCase();
      if (!(f.numer_faktury?.toLowerCase().includes(search) ||
            f.kontrahent?.nazwa?.toLowerCase().includes(search))) {
        return false;
      }
    }
    
    // Filtr roku
    if (sortYear && f.data_wystawienia) {
      const year = new Date(f.data_wystawienia).getFullYear().toString();
      if (year !== sortYear) return false;
    }
    
    // Filtr miesiąca
    if (sortMonth && f.data_wystawienia) {
      const month = (new Date(f.data_wystawienia).getMonth() + 1).toString();
      if (month !== sortMonth) return false;
    }
    
    return true;
  });

  if (loading) {
    return <div className="text-center py-12">Ładowanie faktur...</div>;
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-gray-900">Faktury</h1>
        
        <div className="flex gap-3">
          <div className="flex items-center gap-2">
            <input
              id="file-upload"
              type="file"
              accept=".xml"
              onChange={(e) => setUploadFile(e.target.files[0])}
              className="hidden"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Upload className="w-4 h-4 mr-2" />
              Wybierz XML
            </label>
            {uploadFile && (
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
              >
                {uploading ? 'Importowanie...' : 'Import'}
              </button>
            )}
          </div>

<button
  onClick={handleKsefSync}
  className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
>
  🔄 Sync KSeF
</button>

          <button
            onClick={handleExport}
            disabled={selected.length === 0 || exporting}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors shadow-lg hover:shadow-xl"
          >
            <Download className="w-4 h-4 mr-2" />
            {exporting ? 'Generowanie...' : `Generuj XML (${selected.length})`}
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-lg">
        <div className="flex items-center gap-4 flex-wrap">
          <Filter className="w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Szukaj po numerze lub kontrahencie..."
            value={filterSearch}
            onChange={(e) => setFilterSearch(e.target.value)}
            className="flex-1 min-w-[200px] px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={sortYear}
            onChange={(e) => setSortYear(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Wszystkie lata</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
          </select>
          <select
            value={sortMonth}
            onChange={(e) => setSortMonth(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Wszystkie miesiące</option>
            <option value="1">Styczeń</option>
            <option value="2">Luty</option>
            <option value="3">Marzec</option>
            <option value="4">Kwiecień</option>
            <option value="5">Maj</option>
            <option value="6">Czerwiec</option>
            <option value="7">Lipiec</option>
            <option value="8">Sierpień</option>
            <option value="9">Wrzesień</option>
            <option value="10">Październik</option>
            <option value="11">Listopad</option>
            <option value="12">Grudzień</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Wszystkie statusy</option>
            <option value="NOWA">Nowe</option>
            <option value="WYEKSPORTOWANA">Wyeksportowane</option>
            <option value="ZAPLACONA">Zapłacone</option>
          </select>
          {(filterSearch || filterStatus || sortYear || sortMonth) && (
            <button
              onClick={() => {
                setFilterSearch('');
                setFilterStatus('');
                setSortYear('');
                setSortMonth('');
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Wyczyść
            </button>
          )}
        </div>
      </div>

      {uploadFile && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-blue-600" />
            <span className="text-blue-900 font-medium">{uploadFile.name}</span>
          </div>
          <button
            onClick={() => {
              setUploadFile(null);
              document.getElementById('file-upload').value = '';
            }}
            className="text-blue-600 hover:text-blue-800"
          >
            Usuń
          </button>
        </div>
      )}

      <div className="bg-white shadow-xl rounded-xl overflow-x-auto">
        <table className="w-full table-auto divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-4 w-12">
                <input
                  type="checkbox"
                  checked={selected.length === filteredFaktury.length && filteredFaktury.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded text-blue-600"
                />
              </th>
              {/* PO - bez min-w, tabela dopasuje się do ekranu: */}
<th className="px-3 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
  Numer
</th>
<th className="px-3 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
  Kontrahent
</th>
<th className="px-3 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
  Data wystawienia
</th>
<th className="px-3 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
  Termin płatności
</th>
<th className="px-3 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
  Kwota brutto
</th>
<th className="px-3 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
  Forma płatności
</th>
<th className="px-3 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
  Status
</th>
<th className="px-3 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
  Akcje
</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredFaktury.map((faktura) => (
              <tr key={faktura.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-4">
                  <input
                    type="checkbox"
                    checked={selected.includes(faktura.id)}
                    onChange={() => toggleSelect(faktura.id)}
                    className="rounded text-blue-600"
                  />
                </td>
                <td className="px-4 py-4 text-sm font-semibold text-gray-900">
                  {faktura.numer_faktury}
                </td>
                <td className="px-4 py-4 text-sm text-gray-900">
                  {faktura.kontrahent?.nazwa || <span className="text-gray-400 italic">Brak</span>}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  {faktura.data_wystawienia ? format(new Date(faktura.data_wystawienia), 'dd.MM.yyyy') : '-'}
                </td>
                <td className={`px-4 py-4 whitespace-nowrap text-sm ${getTerminColor(faktura.termin_platnosci, faktura.status, faktura.forma_platnosci)}`}>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {faktura.termin_platnosci ? format(new Date(faktura.termin_platnosci), 'dd.MM.yyyy') : '-'}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                  {parseFloat(faktura.kwota_brutto).toFixed(2)} {faktura.waluta}
                </td>
                <td className="px-4 py-4">
                  {getFormaPlatnosci(faktura.forma_platnosci)}
                </td>
                <td className="px-4 py-4">
                  {getStatusBadge(faktura.status)}
                </td>
                <td className="px-4 py-4 text-sm">
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => setDetailsModal(faktura)}
                      className="text-blue-600 hover:text-blue-900 font-medium text-left whitespace-nowrap"
                    >
                      📄 Szczegóły
                    </button>
                    {faktura.rachunek && faktura.status === 'NOWA' && (
                      <button
                        onClick={() => handleVerify(faktura.id)}
                        className="text-green-600 hover:text-green-900 font-medium text-left whitespace-nowrap"
                      >
                        ✓ Weryfikuj
                      </button>
                    )}
                    {(faktura.status === 'NOWA' || faktura.status === 'WYEKSPORTOWANA') && (
                      <button
                        onClick={() => handleMarkPaid(faktura.id)}
                        className="text-purple-600 hover:text-purple-900 font-medium text-left whitespace-nowrap"
                      >
                        💳 Zapłacona
                      </button>
                    )}
                    {faktura.status === 'ZAPLACONA' && (
                      <button
                        onClick={() => handleRevert(faktura.id, 'NOWA')}
                        className="text-orange-600 hover:text-orange-900 font-medium text-left whitespace-nowrap"
                      >
                        ↩️ Cofnij
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredFaktury.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            {filterSearch || filterStatus || sortYear || sortMonth ? 'Brak faktur spełniających kryteria' : 'Brak faktur'}
          </div>
        )}
      </div>

      {detailsModal && (
        <FakturaDetails
          faktura={detailsModal}
          onClose={() => setDetailsModal(null)}
        />
      )}
    </div>
  );
}
