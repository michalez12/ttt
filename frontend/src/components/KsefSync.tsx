import { useState } from "react";
import { toast } from "react-hot-toast";
import { ksefApi } from "../services/api";

interface KsefSyncProps {
  onSyncComplete?: () => void;
}

const today = new Date();
const weekAgo = new Date(today);
weekAgo.setDate(today.getDate() - 7);
const formatDate = (d: Date) => d.toISOString().slice(0, 10);

export default function KsefSync({ onSyncComplete }: KsefSyncProps) {
  const [loading, setLoading] = useState(false);
  const [dateFrom, setDateFrom] = useState(formatDate(weekAgo));
  const [dateTo, setDateTo] = useState(formatDate(today));

  const handleSync = async () => {
    try {
      setLoading(true);
      const result = await ksefApi.syncInvoices(dateFrom, dateTo);
      toast.success(result.message ?? "Synchronizacja zakończona.");
      onSyncComplete?.();
    } catch (error: any) {
      toast.error(
        "Błąd synchronizacji: " +
          (error?.response?.data?.detail || error?.message || "Nieznany błąd")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      <div className="flex items-center gap-2 text-sm text-gray-700">
        <span>Zakres dat:</span>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="border rounded px-2 py-1 text-sm"
        />
        <span>-</span>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="border rounded px-2 py-1 text-sm"
        />
      </div>

      <button
        type="button"
        onClick={handleSync}
        disabled={loading}
        className={`inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          loading ? "opacity-60 cursor-not-allowed" : ""
        }`}
      >
        <span className="mr-2">🔄</span>
        {loading ? "Synchronizuję..." : "Sync KSeF"}
      </button>
    </div>
  );
}
