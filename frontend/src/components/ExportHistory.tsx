import { useEffect, useState } from "react";
import { Download, Trash2, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { ksefApi } from "../services/api";

interface EksportItem {
  id: number;
  nazwa_pliku: string;
  status: string;
  data_eksportu: string;
  liczba_faktur: number;
  suma_kwot?: number;
}

const STATUS_OPTIONS = [
  { value: "", label: "Wszystkie" },
  { value: "WYGENEROWANY", label: "Wygenerowany" },
  { value: "ANULOWANY", label: "Anulowany" },
];

const STATUS_COLORS: Record<string, string> = {
  WYGENEROWANY: "bg-green-100 text-green-800",
  ANULOWANY: "bg-red-100 text-red-800",
};

export default function ExportHistory() {
  const [eksporty, setEksporty] = useState<EksportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

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
      toast.error("Nie udało się załadować historii eksportów");
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
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error("Błąd pobierania pliku");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Czy na pewno chcesz usunąć ten eksport?")) return;
    setDeletingId(id);
    try {
      await ksefApi.deleteExport(id);
      toast.success("Eksport usunięty");
      setEksporty((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status: "ANULOWANY" } : e))
      );
    } catch (error) {
      toast.error("Błąd usuwania eksportu");
    } finally {
      setDeletingId(null);
    }
  };

  // Filtrowanie po stronie frontu
  const filtered = eksporty.filter((e) => {
    if (filterStatus && e.status !== filterStatus) return false;
    if (filterDateFrom) {
      const eksportDate = new Date(e.data_eksportu);
      const from = new Date(filterDateFrom);
      if (eksportDate < from) return false;
    }
    if (filterDateTo) {
      const eksportDate = new Date(e.data_eksportu);
      const to = new Date(filterDateTo);
      to.setHours(23, 59, 59);
      if (eksportDate > to) return false;
    }
    return true;
  });

  const clearFilters = () => {
    setFilterStatus("");
    setFilterDateFrom("");
    setFilterDateTo("");
  };

  const hasActiveFilters = filterStatus || filterDateFrom || filterDateTo;

  return (
    <div className="space-y-4">
      {/* Nagłówek */}
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
          className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" />
          Odśwież
        </button>
      </div>

      {/* Filtry */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Data od
            </label>
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Data do
            </label>
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Wyczyść filtry
            </button>
          )}
        </div>

        <p className="mt-2 text-xs text-gray-400">
          Pokazuję {filtered.length} z {eksporty.length} eksportów
        </p>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-sm border p-6 text-sm text-gray-500">
          Ładowanie historii...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border p-6 text-center text-sm text-gray-500">
          {hasActiveFilters
            ? "Brak eksportów spełniających kryteria filtrowania."
            : "Brak eksportów."}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((eksport) => (
            <div
              key={eksport.id}
              className={`bg-white rounded-lg shadow-sm border p-4 flex items-center justify-between gap-4 ${
                eksport.status === "ANULOWANY" ? "opacity-50" : ""
              }`}
            >
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm text-gray-800 truncate">
                    {eksport.nazwa_pliku}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      STATUS_COLORS[eksport.status] ||
                      "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {eksport.status}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                  <span>
                    {eksport.data_eksportu
                      ? format(
                          new Date(eksport.data_eksportu),
                          "dd.MM.yyyy HH:mm"
                        )
                      : "-"}
                  </span>
                  <span>{eksport.liczba_faktur} faktur</span>
                  {eksport.suma_kwot != null && (
                    <span className="font-medium text-gray-700">
                      {eksport.suma_kwot.toFixed(2)} PLN
                    </span>
                  )}
                </div>
              </div>

              {/* Przyciski */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Pobierz – tylko dla nieusunięty */}
                {eksport.status !== "ANULOWANY" && (
                  <button
                    onClick={() =>
                      handleDownload(eksport.id, eksport.nazwa_pliku)
                    }
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Pobierz
                  </button>
                )}

                {/* Usuń – tylko dla nieusunięty */}
                {eksport.status !== "ANULOWANY" && (
                  <button
                    onClick={() => handleDelete(eksport.id)}
                    disabled={deletingId === eksport.id}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {deletingId === eksport.id ? "Usuwanie..." : "Usuń"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
