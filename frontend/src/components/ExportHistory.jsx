import { useEffect, useState } from 'react';
import { getExportHistory, downloadExport } from '../services/api';
import { Download, FileText, Calendar, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

export default function ExportHistory() {
  const [eksporty, setEksporty] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await getExportHistory();
      setEksporty(data.items || []);
    } catch (error) {
      console.error('Błąd ładowania historii:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (id, nazwa) => {
    try {
      const blob = await downloadExport(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = nazwa;
      a.click();
    } catch (error) {
      alert('Błąd pobierania pliku');
    }
  };

  if (loading) {
    return <div className="text-center py-12">Ładowanie historii...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold text-gray-900">Historia eksportów</h1>

      <div className="grid gap-4">
        {eksporty.map((eksport) => (
          <div
            key={eksport.id}
            className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="w-6 h-6 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    {eksport.nazwa_pliku}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    eksport.status === 'WYGENEROWANY' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {eksport.status}
                  </span>
                </div>
                
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(eksport.data_eksportu), 'dd.MM.yyyy HH:mm')}
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    {eksport.liczba_faktur} faktur
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    {eksport.suma_kwot?.toFixed(2)} PLN
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleDownload(eksport.id, eksport.nazwa_pliku)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Pobierz
              </button>
            </div>
          </div>
        ))}

        {eksporty.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Brak eksportów
          </div>
        )}
      </div>
    </div>
  );
}
