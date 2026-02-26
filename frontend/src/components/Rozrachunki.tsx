import { useState, useEffect } from "react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { ChevronDown, ChevronRight, RefreshCw } from "lucide-react";
import { ksefApi, KontrahentSummary, Faktura } from "../services/api";

export default function Rozrachunki() {
  const [summary, setSummary] = useState<KontrahentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [faktury, setFaktury] = useState<Faktura[]>([]);
  const [loadingFaktury, setLoadingFaktury] = useState(false);

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      setLoading(true);
      const data = await ksefApi.getKontrahenciSummary();
      setSummary(data);
    } catch {
      toast.error("Błąd ładowania rozrachunków");
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = async (kontrahentId: number) => {
    if (expanded === kontrahentId) {
      setExpanded(null);
      setFaktury([]);
      return;
    }
    setExpanded(kontrahentId);
    setLoadingFaktury(true);
    try {
      const data = await ksefApi.getFaktury();
      const wszystkie: Faktura[] = data.items || [];
      setFaktury(wszystkie.filter(f => f.kontrahent?.id === kontrahentId));
    } catch {
      toast.error("Błąd ładowania faktur kontrahenta");
    } finally {
      setLoadingFaktury(false);
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
      minimumFractionDigits: 2,
    }).format(value);

  const filtered = summary.filter(k =>
    !search ||
    k.nazwa.toLowerCase().includes(search.toLowerCase()) ||
    k.nip.includes(search)
  );

  const totalSaldo = filtered.reduce((s, k) => s + k.saldo, 0);
  const totalFaktury = filtered.reduce((s, k) => s + k.suma_faktur, 0);
  const totalKorekty = filtered.reduce((s, k) => s + k.suma_korekt, 0);

  if (loading) return (
    <div className="bg-white rounded-lg border p-6 text-center text-gray-500">
      Ładowanie rozrachunków...
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Nagłówek */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Rozrachunki</h1>
          <p className="text-sm text-gray-500">
            Zestawienie należności per kontrahent z uwzględnieniem korekt.
          </p>
        </div>
        <button
          onClick={loadSummary}
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <RefreshCw className="h-4 w-4" />
          Odśwież
        </button>
      </div>

      {/* Kafelki podsumowania */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs font-medium uppercase text-gray-500">Suma faktur</p>
          <p className="mt-1 text-2xl font-semibold text-gray-800">{formatCurrency(totalFaktury)}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs font-medium uppercase text-gray-500">Suma korekt</p>
          <p className="mt-1 text-2xl font-semibold text-amber-600">{formatCurrency(totalKorekty)}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs font-medium uppercase text-gray-500">Łączne saldo</p>
          <p className={`mt-1 text-2xl font-semibold ${totalSaldo > 0 ? "text-red-600" : "text-green-600"}`}>
            {formatCurrency(totalSaldo)}
          </p>
        </div>
      </div>

      {/* Wyszukiwarka */}
      <div className="bg-white rounded-lg border p-4">
        <input
          type="text"
          placeholder="Szukaj kontrahenta (nazwa lub NIP)..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full max-w-sm border rounded px-3 py-1.5 text-sm"
        />
        <p className="mt-1 text-xs text-gray-500">
          Pokazano: {filtered.length} z {summary.length} kontrahentów
        </p>
      </div>

      {/* Tabela kontrahentów */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-8 px-4 py-3"></th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Kontrahent</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">NIP</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">Faktur</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">Suma faktur</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">Suma korekt</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">Kor. nierozl.</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">Saldo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(k => (
              <>
                {/* Wiersz kontrahenta */}
                <tr
                  key={k.kontrahent_id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => toggleExpand(k.kontrahent_id)}
                >
                  <td className="px-4 py-3 text-gray-400">
                    {expanded === k.kontrahent_id
                      ? <ChevronDown className="h-4 w-4" />
                      : <ChevronRight className="h-4 w-4" />
                    }
                  </td>
                  <td className="px-4 py-3 font-medium">{k.nazwa}</td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">{k.nip}</td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {/* liczba faktur nie ma w summary - pokaz dash */}
                    —
                  </td>
                  <td className="px-4 py-3 text-right">{formatCurrency(k.suma_faktur)}</td>
                  <td className="px-4 py-3 text-right text-amber-600">
                    {k.suma_korekt !== 0 ? formatCurrency(k.suma_korekt) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {k.korekty_nierozliczone > 0 ? (
                      <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                        {k.korekty_nierozliczone}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">
                    <span className={k.saldo > 0 ? "text-red-600" : "text-green-600"}>
                      {formatCurrency(k.saldo)}
                    </span>
                  </td>
                </tr>

                {/* Rozwinięcie — lista faktur */}
                {expanded === k.kontrahent_id && (
                  <tr key={`${k.kontrahent_id}-detail`}>
                    <td colSpan={8} className="bg-gray-50 px-8 py-3">
                      {loadingFaktury ? (
                        <p className="text-sm text-gray-500 py-2">Ładowanie faktur...</p>
                      ) : faktury.length === 0 ? (
                        <p className="text-sm text-gray-500 py-2">Brak faktur.</p>
                      ) : (
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="text-gray-500 border-b">
                              <th className="py-1 text-left">Numer</th>
                              <th className="py-1 text-left">Typ</th>
                              <th className="py-1 text-left">Data</th>
                              <th className="py-1 text-left">Termin</th>
                              <th className="py-1 text-right">Kwota brutto</th>
                              <th className="py-1 text-left">Status</th>
                              <th className="py-1"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {faktury.map(f => (
                              <tr key={f.id} className={f.czy_korekta ? "bg-amber-50" : ""}>
                                <td className="py-1.5 font-medium">
                                  {f.numer_faktury}
                                  {f.czy_korekta && (
                                    <span className="ml-1 rounded bg-amber-200 px-1 text-amber-800 font-semibold">
                                      KOR
                                    </span>
                                  )}
                                </td>
                                <td className="py-1.5 text-gray-500">
                                  {f.czy_korekta ? "Korekta" : "Faktura VAT"}
                                </td>
                                <td className="py-1.5">
                                  {f.data_wystawienia
                                    ? format(new Date(f.data_wystawienia), "dd.MM.yyyy", { locale: pl })
                                    : "-"}
                                </td>
                                <td className="py-1.5">
                                  {f.czy_korekta ? (
                                    <span className={`font-medium ${f.czy_rozliczona ? "text-green-600" : "text-red-600"}`}>
                                      {f.czy_rozliczona ? "Rozliczona" : "Nierozliczona"}
                                    </span>
                                  ) : (
                                    f.termin_platnosci
                                      ? format(new Date(f.termin_platnosci), "dd.MM.yyyy", { locale: pl })
                                      : "-"
                                  )}
                                </td>
                                <td className="py-1.5 text-right font-medium">
                                  <span className={f.czy_korekta ? "text-amber-700" : ""}>
                                    {Number(f.kwota_brutto).toFixed(2)} {f.waluta}
                                  </span>
                                </td>
                                <td className="py-1.5">
                                  {f.czy_korekta ? (
                                    <span className={`px-1.5 py-0.5 rounded text-xs font-semibold ${f.czy_rozliczona ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                      {f.czy_rozliczona ? "Rozliczona" : "Nierozliczona"}
                                    </span>
                                  ) : (
                                    <span className={`px-1.5 py-0.5 rounded text-xs font-semibold ${
                                      f.status === "ZAPLACONA" ? "bg-purple-100 text-purple-800" :
                                      f.status === "WYEKSPORTOWANA" ? "bg-green-100 text-green-800" :
                                      "bg-blue-100 text-blue-800"
                                    }`}>
                                      {f.status}
                                    </span>
                                  )}
                                </td>
                                <td className="py-1.5 text-right">
                                  <Link
                                    to={`/faktury/${f.id}`}
                                    className="text-blue-600 hover:underline"
                                    onClick={e => e.stopPropagation()}
                                  >
                                    Szczegóły →
                                  </Link>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="border-t-2">
                            <tr>
                              <td colSpan={4} className="py-1.5 text-right text-gray-500 font-medium">
                                Suma:
                              </td>
                              <td className="py-1.5 text-right font-bold">
                                {formatCurrency(faktury.reduce((s, f) => s + f.kwota_brutto, 0))}
                              </td>
                              <td colSpan={2}></td>
                            </tr>
                          </tfoot>
                        </table>
                      )}
                    </td>
                  </tr>
                )}
              </>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                  Brak kontrahentów
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
