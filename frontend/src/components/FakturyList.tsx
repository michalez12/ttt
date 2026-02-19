import { useState, useEffect } from 'react';
import { Search, Filter, Download, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import KsefSync from './KsefSync';
import FakturaCard from './FakturaCard';
import { ksefApi } from '../services/api';
import { Faktura } from '../services/api';

export default function FakturyList() {
  const [selectedFaktury, setSelectedFaktury] = useState<number[]>([]);
  const [filters, setFilters] = useState({
    tylko_do_eksportu: false,
    search: '',
  });

  const { data, refetch, isLoading } = useQuery({
    queryKey: ['faktury', filters],
    queryFn: () => ksefApi.getFaktury(filters),
  });

  const handleSyncComplete = () => {
    refetch();
    toast.success('Faktury zsynchronizowane!');
  };

  const toggleSelect = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedFaktury([...selectedFaktury, id]);
    } else {
      setSelectedFaktury(selectedFaktury.filter(s => s !== id));
    }
  };

  const handleExport = async () => {
    if (selectedFaktury.length === 0) {
      toast.error('Wybierz faktury do eksportu');
      return;
    }

    try {
      const response = await ksefApi.generateExport(selectedFaktury);
      toast.success('XML wygenerowany! Pobierz z historii eksportów.');
      setSelectedFaktury([]);
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Błąd generowania XML');
    }
  };

  const sumaWybranych = data?.items
    ?.filter((f: Faktura) => selectedFaktury.includes(f.id))
    .reduce((sum, f) => sum + f.kwota_brutto, 0) || 0;

  return (
    <div>
      <KsefSync onSyncComplete={handleSyncComplete} />

      {/* Filtry i akcje */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Szukaj po numerze faktury lub kontrahencie..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center space-x-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filters.tylko_do_eksportu}
                onChange={(e) => setFilters({ ...filters, tylko_do_eksportu: e.target.checked })}
                className="rounded border-gray-300"
              />
              <span className="text-sm">Tylko do eksportu</span>
            </label>
            <Filter className="w-5 h-5 text-gray-400 cursor-pointer" />
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="text-sm text-gray-600">
            {data?.total || 0} faktur
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-lg font-bold text-green-600">
              Suma wybranych: {sumaWybranych.toLocaleString('pl-PL')} PLN
            </div>
            <button
              onClick={handleExport}
              disabled={selectedFaktury.length === 0}
              className="flex items-center space-x-2 px-6 py-2.5 bg-green-600 text-white font-medium rounded-lg shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Eksportuj zaznaczone</span>
            </button>
            <button
              onClick={() => setSelectedFaktury([])}
              className="flex items-center space-x-2 px-4 py-2.5 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
            >
              <Trash2 className="w-4 h-4" />
              <span>Wyczyść</span>
            </button>
          </div>
        </div>
      </div>

      {/* Lista faktur */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            Ładowanie faktur...
          </div>
        ) : data?.items && data.items.length > 0 ? (
          data.items.map((faktura: Faktura) => (
            <FakturaCard
              key={faktura.id}
              faktura={faktura}
              selected={selectedFaktury.includes(faktura.id)}
              onToggleSelect={toggleSelect.bind(null, faktura.id)}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-gray-500">
            Brak faktur do wyświetlenia
          </div>
        )}
      </div>
    </div>
  );
}
