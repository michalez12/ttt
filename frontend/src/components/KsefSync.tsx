import { useState } from 'react';
import { RefreshCw, Download, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { ksefApi, SyncResponse } from '../services/api';

interface KsefSyncProps {
  onSyncComplete?: (data: SyncResponse) => void;
}

export default function KsefSync({ onSyncComplete }: KsefSyncProps) {
  const [loading, setLoading] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const handleSync = async () => {
    setLoading(true);
    try {
      const response = await ksefApi.syncInvoices(dateFrom, dateTo);
      toast.success(response.message);
      onSyncComplete?.(response);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Błąd synchronizacji z KSeF');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <RefreshCw className="w-5 h-5 mr-2" />
        Synchronizacja z KSeF
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Od daty
          </label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Do daty
          </label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      <button
        onClick={handleSync}
        disabled={loading}
        className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white font-medium rounded-lg shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        <span>{loading ? 'Synchronizacja...' : 'Pobierz faktury z KSeF'}</span>
      </button>
    </div>
  );
}
