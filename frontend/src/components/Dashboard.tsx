import { useEffect, useState } from "react";
import {
  FileText,
  TrendingUp,
  Clock,
  CheckCircle,
  Calendar,
  AlertCircle,
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
import { Pie, Bar } from "react-chartjs-2";
import { ksefApi, Faktura } from "../services/api";

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

interface DashboardStats {
  total: number;
  nowe: number;
  wyeksportowane: number;
  sumaDoZaplaty: number;
  przeterminowane: number;
  wTygodniu: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    nowe: 0,
    wyeksportowane: 0,
    sumaDoZaplaty: 0,
    przeterminowane: 0,
    wTygodniu: 0,
  });
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [fakturyData, eksportyData] = await Promise.all([
        ksefApi.getFaktury(),
        ksefApi.getExportHistory(),
      ]);

      const faktury: Faktura[] = fakturyData.items || [];
      const today = new Date();

      const nowe = faktury.filter((f) => f.status === "NOWA").length;
      const wyeksportowane = faktury.filter(
        (f) => f.status === "WYEKSPORTOWANA"
      ).length;

      const suma = faktury
        .filter((f) => f.status === "NOWA")
        .reduce((acc, f) => acc + Number(f.kwota_brutto || 0), 0);

      const przeterminowane = faktury.filter((f) => {
        if (!f.termin_platnosci || f.status !== "NOWA") return false;
        return new Date(f.termin_platnosci) < today;
      }).length;

      const weekLater = new Date(today);
      weekLater.setDate(today.getDate() + 7);

      const wTygodniu = faktury.filter((f) => {
        if (!f.termin_platnosci || f.status !== "NOWA") return false;
        const termin = new Date(f.termin_platnosci);
        return termin >= today && termin <= weekLater;
      }).length;

      setStats({
        total: faktury.length,
        nowe,
        wyeksportowane,
        sumaDoZaplaty: suma,
        przeterminowane,
        wTygodniu,
      });

      const statusData = {
        labels: ["Nowe", "Wyeksportowane", "Zapłacone"],
        datasets: [
          {
            data: [
              nowe,
              wyeksportowane,
              faktury.filter((f) => f.status === "ZAPLACONA").length,
            ],
            backgroundColor: ["#3B82F6", "#10B981", "#6B7280"],
          },
        ],
      };

      setChartData(statusData);
    } catch (error) {
      console.error("Błąd ładowania statystyk:", error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({
    icon: Icon,
    label,
    value,
    color,
    bgColor,
    alert,
  }: {
    icon: any;
    label: string;
    value: string | number;
    color: string;
    bgColor: string;
    alert?: boolean;
  }) => (
    <div className={`relative overflow-hidden rounded-xl border bg-white p-4`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className={`mt-1 text-2xl font-semibold ${color}`}>{value}</p>
        </div>
        <div
          className={`rounded-full p-3 ${bgColor} text-white flex items-center justify-center`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {alert && (
        <div className="mt-3 flex items-center text-xs text-red-600">
          <AlertCircle className="mr-1 h-4 w-4" />
          <span>Wymagają uwagi</span>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        Ładowanie dashboardu...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Nagłówek */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Dashboard
          </h1>
          <p className="text-sm text-gray-500">
            Podsumowanie faktur, terminów płatności i eksportów.
          </p>
        </div>
        <button
          onClick={loadStats}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm hover:bg-gray-50"
        >
          Odśwież
        </button>
      </div>

      {/* Kafelki statystyk */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
        <StatCard
          icon={FileText}
          label="Wszystkie faktury"
          value={stats.total}
          color="text-gray-900"
          bgColor="bg-gray-900"
        />
        <StatCard
          icon={Clock}
          label="Faktury do zapłaty"
          value={stats.nowe}
          color="text-blue-600"
          bgColor="bg-blue-600"
        />
        <StatCard
          icon={TrendingUp}
          label="Wyeksportowane"
          value={stats.wyeksportowane}
          color="text-green-600"
          bgColor="bg-green-600"
        />
        <StatCard
          icon={CheckCircle}
          label="Łączna kwota do zapłaty"
          value={`${stats.sumaDoZaplaty.toFixed(2)} PLN`}
          color="text-emerald-600"
          bgColor="bg-emerald-600"
        />
        <StatCard
          icon={AlertCircle}
          label="Przeterminowane"
          value={stats.przeterminowane}
          color="text-red-600"
          bgColor="bg-red-600"
          alert={stats.przeterminowane > 0}
        />
        <StatCard
          icon={Calendar}
          label="Płatne w ciągu 7 dni"
          value={stats.wTygodniu}
          color="text-orange-600"
          bgColor="bg-orange-600"
        />
      </div>

      {/* Wykres + podsumowanie */}
      {chartData && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-xl border bg-white p-4">
            <h3 className="mb-4 text-sm font-medium text-gray-700">
              Status faktur
            </h3>
            <Pie data={chartData} />
          </div>

          <div className="rounded-xl border bg-white p-4">
            <h3 className="mb-4 text-sm font-medium text-gray-700">
              Podsumowanie
            </h3>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-center justify-between">
                <span>Faktury do zapłaty</span>
                <span className="font-semibold">{stats.nowe}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Wyeksportowane</span>
                <span className="font-semibold">
                  {stats.wyeksportowane}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Łączna kwota do zapłaty</span>
                <span className="font-semibold">
                  {stats.sumaDoZaplaty.toFixed(2)} PLN
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
