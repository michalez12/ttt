import { useEffect, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import {
  FileText,
  TrendingUp,
  Clock,
  CheckCircle,
  Calendar,
  AlertCircle,
  RefreshCw,
  RotateCcw,
} from "lucide-react";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Pie } from "react-chartjs-2";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { ksefApi, Faktura } from "../services/api";

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface DashboardStats {
  total: number;
  nowe: number;
  wyeksportowane: number;
  zaplacone: number;
  sumaDoZaplaty: number;
  przeterminowane: number;
  wTygodniu: number;
  liczbaKorekt: number;
  korektaNierozliczona: number;
  sumaKorektNierozliczonych: number;
}

const EMPTY_STATS: DashboardStats = {
  total: 0, nowe: 0, wyeksportowane: 0, zaplacone: 0,
  sumaDoZaplaty: 0, przeterminowane: 0, wTygodniu: 0,
  liczbaKorekt: 0, korektaNierozliczona: 0, sumaKorektNierozliczonych: 0,
};

export default function Dashboard() {
  const location = useLocation();
  const currentYear = new Date().getFullYear();

  const [allFaktury, setAllFaktury] = useState<Faktura[]>([]);
  const [loading, setLoading] = useState(true);

  const [filterYear, setFilterYear] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  const availableYears: number[] = [];
  for (let y = 2026; y <= currentYear + 1; y++) availableYears.push(y);

  useEffect(() => { loadData(); }, [location.key]);

  const loadData = async () => {
    try {
      setLoading(true);
      const fakturyData = await ksefApi.getFaktury();
      setAllFaktury(fakturyData.items || []);
    } catch (error) {
      console.error("Błąd ładowania statystyk dashboardu", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFaktury = useMemo(() => {
    return allFaktury.filter(f => {
      if (!f.data_wystawienia) return true;
      const d = new Date(f.data_wystawienia);
      if (filterYear && d.getFullYear().toString() !== filterYear) return false;
      if (filterMonth && (d.getMonth() + 1).toString() !== filterMonth) return false;
      if (filterDateFrom && f.data_wystawienia < filterDateFrom) return false;
      if (filterDateTo && f.data_wystawienia > filterDateTo) return false;
      return true;
    });
  }, [allFaktury, filterYear, filterMonth, filterDateFrom, filterDateTo]);

  const stats = useMemo((): DashboardStats => {
    const now = new Date();
    const in7Days = new Date();
    in7Days.setDate(now.getDate() + 7);

    let total = 0, nowe = 0, wyeksportowane = 0, zaplacone = 0;
    let sumaDoZaplaty = 0, przeterminowane = 0, wTygodniu = 0;
    let liczbaKorekt = 0, korektaNierozliczona = 0, sumaKorektNierozliczonych = 0;

    filteredFaktury.forEach(f => {
      const isKorekta = !!f.czy_korekta;
      total += 1;

      if (!isKorekta) {
        if (f.status === "NOWA") nowe += 1;
        else if (f.status === "WYEKSPORTOWANA") wyeksportowane += 1;
        else if (f.status === "ZAPLACONA") zaplacone += 1;
      }

      if (f.termin_platnosci && !isKorekta) {
        const termin = new Date(f.termin_platnosci);
        if (termin < now && f.status !== "ZAPLACONA") przeterminowane += 1;
        if (termin >= now && termin <= in7Days && f.status !== "ZAPLACONA") wTygodniu += 1;
      }

      if (!isKorekta && f.status !== "ZAPLACONA") {
        sumaDoZaplaty += f.kwota_brutto;
      }

      if (isKorekta) {
        liczbaKorekt += 1;
        if (!f.czy_rozliczona) {
          korektaNierozliczona += 1;
          sumaKorektNierozliczonych += f.kwota_brutto;
        }
      }
    });

    return {
      total, nowe, wyeksportowane, zaplacone,
      sumaDoZaplaty, przeterminowane, wTygodniu,
      liczbaKorekt, korektaNierozliczona, sumaKorektNierozliczonych,
    };
  }, [filteredFaktury]);

  const chartData = useMemo(() => ({
    labels: ["Nowe", "Wyeksportowane", "Zapłacone", "Przeterminowane", "Korekty"],
    datasets: [{
      data: [stats.nowe, stats.wyeksportowane, stats.zaplacone, stats.przeterminowane, stats.liczbaKorekt],
      backgroundColor: [
        "rgba(59, 130, 246, 0.8)",
        "rgba(16, 185, 129, 0.8)",
        "rgba(139, 92, 246, 0.8)",
        "rgba(239, 68, 68, 0.8)",
        "rgba(234, 179, 8, 0.8)",
      ],
      borderColor: [
        "rgba(59, 130, 246, 1)",
        "rgba(16, 185, 129, 1)",
        "rgba(139, 92, 246, 1)",
        "rgba(239, 68, 68, 1)",
        "rgba(234, 179, 8, 1)",
      ],
      borderWidth: 1,
    }],
  }), [stats]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pl-PL", {
      style: "currency", currency: "PLN", minimumFractionDigits: 2,
    }).format(value);

  const clearFilters = () => {
    setFilterYear("");
    setFilterMonth("");
    setFilterDateFrom("");
    setFilterDateTo("");
  };

  const hasFilters = !!(filterYear || filterMonth || filterDateFrom || filterDateTo);

  return (
    <div className="space-y-6">
      {/* Nagłówek */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard faktur</h1>
          <p className="text-sm text-gray-500">
            Podsumowanie faktur, korekt oraz terminów płatności.
            {hasFilters && (
              <span className="ml-2 text-blue-600 font-medium">
                (filtrowanie aktywne — {filteredFaktury.length} z {allFaktury.length} faktur)
              </span>
            )}
          </p>
        </div>
        <button
          onClick={loadData}
          className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Odśwież
        </button>
      </div>

      {/* Panel filtrów */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Rok</label>
            <select
              value={filterYear}
              onChange={e => { setFilterYear(e.target.value); setFilterMonth(""); setFilterDateFrom(""); setFilterDateTo(""); }}
              className="border rounded px-3 py-1.5 text-sm"
            >
              <option value="">Wszystkie lata</option>
              {availableYears.map(y => <option key={y} value={y.toString()}>{y}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Miesiąc</label>
            <select
              value={filterMonth}
              onChange={e => { setFilterMonth(e.target.value); setFilterDateFrom(""); setFilterDateTo(""); }}
              className="border rounded px-3 py-1.5 text-sm"
              disabled={!!filterDateFrom || !!filterDateTo}
            >
              <option value="">Wszystkie miesiące</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={(i + 1).toString()}>
                  {format(new Date(2000, i, 1), "LLLL", { locale: pl })}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Data od</label>
              <input
                type="date"
                value={filterDateFrom}
                onChange={e => { setFilterDateFrom(e.target.value); setFilterMonth(""); }}
                className="border rounded px-3 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Data do</label>
              <input
                type="date"
                value={filterDateTo}
                onChange={e => { setFilterDateTo(e.target.value); setFilterMonth(""); }}
                className="border rounded px-3 py-1.5 text-sm"
              />
            </div>
          </div>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="px-3 py-1.5 text-sm rounded border border-gray-300 hover:bg-gray-50 text-gray-600"
            >
              ✕ Wyczyść filtry
            </button>
          )}

          {/* Szybkie skróty */}
          <div className="flex gap-2 ml-auto flex-wrap">
            {Array.from({ length: 3 }, (_, i) => {
              const month = (new Date().getMonth() - i + 12) % 12 + 1;
              const year = new Date().getMonth() - i < 0 ? currentYear - 1 : currentYear;
              const label = format(new Date(year, month - 1, 1), "LLL", { locale: pl });
              return (
                <button
                  key={`${year}-${month}`}
                  onClick={() => { setFilterYear(year.toString()); setFilterMonth(month.toString()); setFilterDateFrom(""); setFilterDateTo(""); }}
                  className={`px-2 py-1 text-xs rounded border transition-colors ${
                    filterYear === year.toString() && filterMonth === month.toString()
                      ? "bg-blue-600 text-white border-blue-600"
                      : "hover:bg-gray-50 text-gray-600"
                  }`}
                >
                  {label} {year}
                </button>
              );
            })}
            <button
              onClick={() => { setFilterYear(currentYear.toString()); setFilterMonth(""); setFilterDateFrom(""); setFilterDateTo(""); }}
              className={`px-2 py-1 text-xs rounded border transition-colors ${
                filterYear === currentYear.toString() && !filterMonth && !filterDateFrom
                  ? "bg-blue-600 text-white border-blue-600"
                  : "hover:bg-gray-50 text-gray-600"
              }`}
            >
              Cały {currentYear}
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-500">
          Ładowanie danych...
        </div>
      ) : (
        <>
          {/* Główne kafelki */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase text-gray-500">Wszystkie dokumenty</p>
                  <p className="mt-1 text-2xl font-semibold">{stats.total}</p>
                  {hasFilters && <p className="text-xs text-gray-400">z {allFaktury.length} łącznie</p>}
                </div>
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase text-gray-500">Nowe</p>
                  <p className="mt-1 text-2xl font-semibold">{stats.nowe}</p>
                  <p className="mt-1 text-xs text-gray-500">Oczekują na eksport/płatność</p>
                </div>
                <TrendingUp className="h-8 w-8 text-emerald-500" />
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase text-gray-500">Wyeksportowane</p>
                  <p className="mt-1 text-2xl font-semibold">{stats.wyeksportowane}</p>
                  <p className="mt-1 text-xs text-gray-500">Przelew wygenerowany</p>
                </div>
                <CheckCircle className="h-8 w-8 text-indigo-500" />
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase text-gray-500">Do zapłaty</p>
                  <p className="mt-1 text-2xl font-semibold">{formatCurrency(stats.sumaDoZaplaty)}</p>
                  <p className="mt-1 text-xs text-gray-500">Nowe + wyeksportowane</p>
                </div>
                <Calendar className="h-8 w-8 text-amber-500" />
              </div>
            </div>
          </div>

          {/* Terminy + przeterminowane + korekty */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase text-gray-500">Przeterminowane</p>
                  <p className={`mt-1 text-2xl font-semibold ${stats.przeterminowane > 0 ? "text-red-600" : ""}`}>
                    {stats.przeterminowane}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">Faktury po terminie, nieopłacone.</p>
                </div>
                <AlertCircle className={`h-8 w-8 ${stats.przeterminowane > 0 ? "text-red-500" : "text-gray-300"}`} />
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase text-gray-500">Terminy w 7 dni</p>
                  <p className={`mt-1 text-2xl font-semibold ${stats.wTygodniu > 0 ? "text-yellow-600" : ""}`}>
                    {stats.wTygodniu}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">Zbliżające się terminy płatności.</p>
                </div>
                <Clock className={`h-8 w-8 ${stats.wTygodniu > 0 ? "text-yellow-500" : "text-gray-300"}`} />
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase text-gray-500">Korekty</p>
                  <p className="mt-1 text-2xl font-semibold">{stats.liczbaKorekt}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    Nierozliczone: {stats.korektaNierozliczona} ({formatCurrency(stats.sumaKorektNierozliczonych)})
                  </p>
                </div>
                <RotateCcw className={`h-8 w-8 ${stats.korektaNierozliczona > 0 ? "text-amber-600" : "text-gray-300"}`} />
              </div>
            </div>
          </div>

          {/* Wykres + podsumowanie */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <h2 className="mb-4 text-sm font-semibold text-gray-700">Struktura dokumentów</h2>
              {stats.total > 0 ? (
                <div className="max-w-xs mx-auto">
                  <Pie data={chartData} options={{ plugins: { legend: { position: "bottom" } } }} />
                </div>
              ) : (
                <p className="text-sm text-gray-500">Brak danych do wyświetlenia.</p>
              )}
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-4">
              <div>
                <h2 className="mb-2 text-sm font-semibold text-gray-700">Statusy faktur</h2>
                <div className="space-y-1.5">
                  {[
                    { label: "Nowe", value: stats.nowe, color: "bg-blue-500" },
                    { label: "Wyeksportowane", value: stats.wyeksportowane, color: "bg-green-500" },
                    { label: "Zapłacone", value: stats.zaplacone, color: "bg-purple-500" },
                    { label: "Przeterminowane", value: stats.przeterminowane, color: "bg-red-500" },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-2">
                      <div className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                      <span className="text-sm text-gray-600 w-32">{item.label}</span>
                      <span className="text-sm font-semibold">{item.value}</span>
                      {stats.total > 0 && (
                        <span className="text-xs text-gray-400">
                          ({Math.round(item.value / (stats.total - stats.liczbaKorekt || 1) * 100)}%)
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <hr />

              <div>
                <h2 className="mb-2 text-sm font-semibold text-gray-700">Korekty</h2>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>Łączna liczba korekt: <span className="font-semibold">{stats.liczbaKorekt}</span></p>
                  <p>Nierozliczone: <span className={`font-semibold ${stats.korektaNierozliczona > 0 ? "text-red-600" : "text-green-600"}`}>{stats.korektaNierozliczona}</span></p>
                  <p>Wartość nierozliczonych: <span className="font-semibold">{formatCurrency(stats.sumaKorektNierozliczonych)}</span></p>
                </div>
              </div>

              {hasFilters && (
                <>
                  <hr />
                  <div>
                    <h2 className="mb-2 text-sm font-semibold text-gray-700">Aktywny filtr</h2>
                    <div className="text-sm text-gray-600 space-y-1">
                      {filterYear && <p>Rok: <span className="font-medium">{filterYear}</span></p>}
                      {filterMonth && <p>Miesiąc: <span className="font-medium">{format(new Date(2000, parseInt(filterMonth) - 1, 1), "LLLL", { locale: pl })}</span></p>}
                      {filterDateFrom && <p>Od: <span className="font-medium">{filterDateFrom}</span></p>}
                      {filterDateTo && <p>Do: <span className="font-medium">{filterDateTo}</span></p>}
                      <p className="text-xs text-gray-400">Pokazano {filteredFaktury.length} z {allFaktury.length} faktur</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
