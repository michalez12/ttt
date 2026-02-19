import { useEffect, useState } from 'react';
import { getFaktury, getExportHistory } from '../services/api';
import { FileText, TrendingUp, Clock, CheckCircle, Calendar, AlertCircle } from 'lucide-react';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    nowe: 0,
    wyeksportowane: 0,
    sumaDoZaplaty: 0,
    przeterminowane: 0,
    wTygodniu: 0,
  });
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [fakturyData, eksportyData] = await Promise.all([
        getFaktury(),
        getExportHistory(),
      ]);
      
      const faktury = fakturyData.items || [];
      const today = new Date();

      const nowe = faktury.filter((f) => f.status === 'NOWA').length;
      const wyeksportowane = faktury.filter(
        (f) => f.status === 'WYEKSPORTOWANA'
      ).length;
      const suma = faktury
        .filter((f) => f.status === 'NOWA')
        .reduce((acc, f) => acc + parseFloat(f.kwota_brutto), 0);

      // Przeterminowane
      const przeterminowane = faktury.filter((f) => {
        if (!f.termin_platnosci || f.status !== 'NOWA') return false;
        return new Date(f.termin_platnosci) < today;
      }).length;

      // W tym tygodniu
      const weekLater = new Date(today);
      weekLater.setDate(today.getDate() + 7);
      const wTygodniu = faktury.filter((f) => {
        if (!f.termin_platnosci || f.status !== 'NOWA') return false;
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

      // Dane do wykresów
      const statusData = {
        labels: ['Nowe', 'Wyeksportowane', 'Zapłacone'],
        datasets: [
          {
            data: [nowe, wyeksportowane, faktury.filter(f => f.status === 'ZAPLACONA').length],
            backgroundColor: ['#3B82F6', '#10B981', '#6B7280'],
          },
        ],
      };

      setChartData(statusData);
    } catch (error) {
      console.error('Błąd ładowania statystyk:', error);
    }
  };

  const StatCard = ({ icon: Icon, label, value, color, bgColor, alert }) => (
    <div className={`${bgColor} p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 font-medium">{label}</p>
          <p className={`text-3xl font-bold ${color} mt-2`}>{value}</p>
          {alert && (
            <p className="text-xs text-red-600 mt-1 flex items-center">
              <AlertCircle className="w-3 h-3 mr-1" />
              Wymagają uwagi
            </p>
          )}
        </div>
        <div className={`p-4 rounded-full ${color.replace('text-', 'bg-').replace('600', '100')}`}>
          <Icon className={`w-8 h-8 ${color}`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
        <button
          onClick={loadStats}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Odśwież
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          icon={FileText}
          label="Wszystkie faktury"
          value={stats.total}
          color="text-blue-600"
          bgColor="bg-white"
        />
        <StatCard
          icon={Clock}
          label="Nowe faktury"
          value={stats.nowe}
          color="text-orange-600"
          bgColor="bg-white"
        />
        <StatCard
          icon={CheckCircle}
          label="Wyeksportowane"
          value={stats.wyeksportowane}
          color="text-green-600"
          bgColor="bg-white"
        />
        <StatCard
          icon={TrendingUp}
          label="Suma do zapłaty"
          value={`${stats.sumaDoZaplaty.toFixed(2)} PLN`}
          color="text-purple-600"
          bgColor="bg-white"
        />
        <StatCard
          icon={AlertCircle}
          label="Przeterminowane"
          value={stats.przeterminowane}
          color="text-red-600"
          bgColor="bg-white"
          alert={stats.przeterminowane > 0}
        />
        <StatCard
          icon={Calendar}
          label="Termin w 7 dni"
          value={stats.wTygodniu}
          color="text-yellow-600"
          bgColor="bg-white"
        />
      </div>

      {chartData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Status faktur</h3>
            <div className="h-64 flex items-center justify-center">
              <Pie data={chartData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Podsumowanie</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-gray-700">Faktury do zapłaty</span>
                <span className="font-bold text-blue-600">{stats.nowe}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-gray-700">Wyeksportowane</span>
                <span className="font-bold text-green-600">{stats.wyeksportowane}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="text-gray-700">Łączna kwota</span>
                <span className="font-bold text-purple-600">{stats.sumaDoZaplaty.toFixed(2)} PLN</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
