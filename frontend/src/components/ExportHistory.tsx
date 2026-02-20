import { useEffect, useState } from "react";
import { Download, FileText, Calendar, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { ksefApi } from "../services/api";

interface EksportItem {
  id: number;
  nazwa_pliku: string;
  status: string;
  data_eksportu: string;
  liczba_faktur: number;
  suma_kwot?: number;
}

export default function ExportHistory() {
  const [eksporty, setEksporty] = useState<EksportItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await ksefApi.getExportHistory();
      setEksporty(data.items || data || []);
    } catch (error) {
      console.error("Błąd ładowania historii:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (id: number, nazwa: string) => {
    try {
      const blob = await ksefApi.downloadExport(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = nazwa;
      a.click();
    } catch (error) {
      alert("Błąd pobierania pliku");
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        Ładowanie historii...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Historia eksportów
          </h1>
          <p className="text-sm text-gray-500">
            Lista wygenerowanych plików eksportu XML.
          </p>
        </div>
        <button
          onClick={loadHistory}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm hover:bg-gray-50"
        >
          Odśwież
        </button>
      </div>

      {eksporty.map((eksport) => (
        <div
          key={eksport.id}
          className="rounded-lg border bg-white p-4 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-3"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-blue-50 p-2 text-blue-600">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-800">
                {eksport.nazwa_pliku}
              </h3>
              <p className="text-xs text-gray-500">{eksport.status}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>
                {eksport.data_eksportu
                  ? format(
                      new Date(eksport.data_eksportu),
                      "dd.MM.yyyy HH:mm"
                    )
                  : "-"}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span>{eksport.liczba_faktur} faktur</span>
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              <span>
                {eksport.suma_kwot != null
                  ? `${eksport.suma_kwot.toFixed(2)} PLN`
                  : "-"}
              </span>
            </div>
          </div>

          <div>
            <button
              onClick={() =>
                handleDownload(eksport.id, eksport.nazwa_pliku)
              }
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-700"
            >
              <Download className="h-4 w-4" />
              <span>Pobierz</span>
            </button>
          </div>
        </div>
      ))}

      {eksporty.length === 0 && (
        <div className="bg-white rounded-lg border p-6 text-center text-gray-500">
          Brak eksportów
        </div>
      )}
    </div>
  );
}
