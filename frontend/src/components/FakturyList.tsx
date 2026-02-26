import { useState, useEffect } from "react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { ksefApi, Faktura, FakturyListResponse } from "../services/api";

export default function FakturyList() {
  const [faktury, setFaktury] = useState<Faktura[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number[]>([]);
  const [exporting, setExporting] = useState(false);

  const [filterStatus, setFilterStatus] = useState("");
  const [filterSearch, setFilterSearch] = useState("");
  const [sortYear, setSortYear] = useState("");
  const [sortMonth, setSortMonth] = useState("");
  const [sortDirection, setSortDirection] = useState("desc");
  const [onlyTransfer, setOnlyTransfer] = useState(false);

  // przełącznik MPP przy eksporcie
  const [exportWithMPP, setExportWithMPP] = useState(false);

  const currentYear = new Date().getFullYear();
  const availableYears: number[] = [];
  for (let y = 2026; y <= currentYear + 1; y++) availableYears.push(y);

  useEffect(() => {
    loadFaktury();
  }, []);

  const loadFaktury = async () => {
    try {
      setLoading(true);
      const data: FakturyListResponse = await ksefApi.getFaktury();
      setFaktury(data.items || []);
    } catch {
      toast.error("Błąd ładowania faktur");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPaid = async (id: number) => {
    try {
      await ksefApi.updateFakturaStatus(id, "ZAPLACONA");
      toast.success("Faktura oznaczona jako zapłacona");
      setFaktury((prev) =>
        prev.map((f) => (f.id === id ? { ...f, status: "ZAPLACONA" } : f))
      );
    } catch {
      toast.error("Błąd aktualizacji statusu");
    }
  };

  const handleRevert = async (id: number) => {
    if (
      !window.confirm(
        "Czy na pewno chcesz cofnąć status tej faktury do NOWA?"
      )
    )
      return;
    try {
      await ksefApi.updateFakturaStatus(id, "NOWA");
      toast.success("Status zmieniony na NOWA");
      setFaktury((prev) =>
        prev.map((f) => (f.id === id ? { ...f, status: "NOWA" } : f))
      );
    } catch {
      toast.error("Błąd cofania statusu");
    }
  };

  const handleRozlicz = async (id: number, rozliczona: boolean) => {
    try {
      await ksefApi.rozliczKorekta(id, rozliczona);
      toast.success(
        rozliczona ? "Korekta rozliczona" : "Cofnięto rozliczenie"
      );
      setFaktury((prev) =>
        prev.map((f) =>
          f.id === id ? { ...f, czy_rozliczona: rozliczona } : f
        )
      );
    } catch {
      toast.error("Błąd rozliczania korekty");
    }
  };

  const handleExport = async () => {
    if (selected.length === 0) {
      toast.error("Wybierz co najmniej jedną fakturę");
      return;
    }
    const wybraneFaktury = faktury.filter((f) => selected.includes(f.id));
    const nieDoEksportu = wybraneFaktury.filter(
      (f) => String(f.forma_platnosci) !== "6"
    );
    if (nieDoEksportu.length > 0) {
      toast.error(
        `Te faktury nie mogą być wyeksportowane (forma płatności ≠ przelew): ${nieDoEksportu
          .map((f) => f.numer_faktury)
          .join(", ")}`
      );
      return;
    }
    setExporting(true);
    try {
      // jeśli zaznaczony przełącznik MPP, ustawiamy MPP dla zaznaczonych
      if (exportWithMPP) {
        await ksefApi.setMppBulk(selected, true);
      }

      const result: any = await ksefApi.generateExport(selected);
      toast.success(`XML wygenerowany: ${result.nazwa_pliku}`);
      const blob = await ksefApi.downloadExport(result.eksport_id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.nazwa_pliku;
      a.click();
      setSelected([]);
    } catch (error: any) {
      toast.error(
        "Błąd eksportu: " +
          (error?.response?.data?.detail?.message || error?.message)
      );
    } finally {
      setExporting(false);
    }
  };

  const toggleSelect = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const eksportowalne = sortedFaktury.filter(
      (f) => !onlyTransfer || String(f.forma_platnosci) === "6"
    );
    if (selected.length === eksportowalne.length) setSelected([]);
    else setSelected(eksportowalne.map((f) => f.id));
  };

  const getTerminColor = (
    termin: string | null,
    status: string,
    forma_platnosci: any
  ) => {
    if (status === "ZAPLACONA") return "text-gray-500";
    const fp = String(forma_platnosci);
    if (fp === "1" || fp === "2") return "text-gray-500";
    if (status !== "NOWA") return "text-gray-500";
    if (!termin) return "text-gray-500";
    const today = new Date();
    const terminDate = new Date(termin);
    const diffDays = Math.ceil(
      (terminDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays < 0) return "text-red-600 font-bold";
    if (diffDays <= 3) return "text-orange-600 font-semibold";
    if (diffDays <= 7) return "text-yellow-600";
    return "text-green-600";
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      NOWA: "bg-blue-100 text-blue-800 border border-blue-200",
      WYEKSPORTOWANA: "bg-green-100 text-green-800 border-green-200",
      ZAPLACONA: "bg-purple-100 text-purple-800 border-purple-200",
    };
    return (
      <span
        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
          styles[status] ||
          "bg-gray-100 text-gray-800 border border-gray-200"
        }`}
      >
        {status}
      </span>
    );
  };

  const getFormaPlatnosci = (kod: any) => {
    const formy: Record<
      string,
      { label: string; color: string; emoji: string }
    > = {
      "1": {
        label: "Gotówka",
        color: "bg-gray-100 text-gray-800",
        emoji: "💵",
      },
      "2": { label: "Karta", color: "bg-blue-100 text-blue-800", emoji: "💳" },
      "4": {
        label: "Czek",
        color: "bg-yellow-100 text-yellow-800",
        emoji: "📄",
      },
      "6": {
        label: "Przelew",
        color: "bg-indigo-100 text-indigo-800",
        emoji: "🏦",
      },
      "8": {
        label: "Inna",
        color: "bg-gray-100 text-gray-800",
        emoji: "❔",
      },
    };
    const forma =
      formy[String(kod)] || {
        label: `Kod ${kod}`,
        color: "bg-gray-100 text-gray-800",
        emoji: "❔",
      };
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${forma.color}`}
      >
        <span>{forma.emoji}</span>
        <span>{forma.label}</span>
      </span>
    );
  };

  const filteredFaktury = faktury.filter((f) => {
    if (filterStatus && f.status !== filterStatus) return false;
    if (filterSearch) {
      const s = filterSearch.toLowerCase();
      if (
        !(
          f.numer_faktury?.toLowerCase().includes(s) ||
          f.kontrahent?.nazwa?.toLowerCase().includes(s)
        )
      )
        return false;
    }
    if (
      sortYear &&
      f.data_wystawienia &&
      new Date(f.data_wystawienia).getFullYear().toString() !== sortYear
    )
      return false;
    if (
      sortMonth &&
      f.data_wystawienia &&
      (new Date(f.data_wystawienia).getMonth() + 1).toString() !== sortMonth
    )
      return false;
    return true;
  });

  const sortedFaktury = [...filteredFaktury].sort((a, b) => {
    if (sortDirection === "none") return 0;
    const da = a.data_wystawienia ? new Date(a.data_wystawienia) : null;
    const db = b.data_wystawienia ? new Date(b.data_wystawienia) : null;
    if (!da && !db) return 0;
    if (!da) return 1;
    if (!db) return -1;
    return sortDirection === "asc"
      ? da.getTime() - db.getTime()
      : db.getTime() - da.getTime();
  });

  const visibleEksportowalne = sortedFaktury.filter(
    (f) => !onlyTransfer || String(f.forma_platnosci) === "6"
  );
  const visibleIds = new Set(visibleEksportowalne.map((f) => f.id));
  const selectedVisible = selected.filter((id) => visibleIds.has(id));
  if (selectedVisible.length !== selected.length) setSelected(selectedVisible);

  if (loading)
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        Ładowanie faktur...
      </div>
    );

  return (
    <div className="space-y-4">
      {/* Filtry i akcje */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <input
            type="text"
            placeholder="Szukaj (numer, kontrahent)..."
            value={filterSearch}
            onChange={(e) => setFilterSearch(e.target.value)}
            className="border rounded px-3 py-1.5 text-sm w-56"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border rounded px-3 py-1.5 text-sm"
          >
            <option value="">Wszystkie statusy</option>
            <option value="NOWA">NOWA</option>
            <option value="WYEKSPORTOWANA">WYEKSPORTOWANA</option>
            <option value="ZAPLACONA">ZAPLACONA</option>
          </select>
          <select
            value={sortYear}
            onChange={(e) => setSortYear(e.target.value)}
            className="border rounded px-3 py-1.5 text-sm"
          >
            <option value="">Wszystkie lata</option>
            {availableYears.map((y) => (
              <option key={y} value={y.toString()}>
                {y}
              </option>
            ))}
          </select>
          <select
            value={sortMonth}
            onChange={(e) => setSortMonth(e.target.value)}
            className="border rounded px-3 py-1.5 text-sm"
          >
            <option value="">Wszystkie miesiące</option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={(i + 1).toString()}>
                {format(new Date(2000, i, 1), "LLLL", { locale: pl })}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={onlyTransfer}
              onChange={(e) => setOnlyTransfer(e.target.checked)}
              className="rounded"
            />
            Tylko przelew
          </label>

          {/* przełącznik MPP dla eksportu zaznaczonych */}
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={exportWithMPP}
              onChange={(e) => setExportWithMPP(e.target.checked)}
              className="rounded"
            />
            Eksportuj zaznaczone jako MPP
          </label>

          <div className="ml-auto flex gap-2">
            <button
              onClick={loadFaktury}
              className="px-3 py-1.5 text-sm rounded border hover:bg-gray-50"
            >
              🔄 Odśwież
            </button>
            <button
              onClick={handleExport}
              disabled={exporting || selected.length === 0}
              className="px-4 py-1.5 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {exporting
                ? "Eksportuję..."
                : `📤 Eksportuj (${selected.length})`}
            </button>
          </div>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Pokazano: {sortedFaktury.length} z {faktury.length} faktur
        </p>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={
                    visibleEksportowalne.length > 0 &&
                    selected.length === visibleEksportowalne.length
                  }
                  onChange={toggleSelectAll}
                  className="rounded text-blue-600"
                />
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">
                Numer
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">
                Kontrahent
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">
                <button
                  onClick={() =>
                    setSortDirection((prev) =>
                      prev === "desc" ? "asc" : prev === "asc" ? "none" : "desc"
                    )
                  }
                  className="inline-flex items-center gap-1"
                >
                  Data wystawienia
                  <span className="text-xs text-gray-400">
                    {sortDirection === "desc"
                      ? "↓"
                      : sortDirection === "asc"
                      ? "↑"
                      : "-"}
                  </span>
                </button>
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">
                Termin płatności
              </th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">
                Kwota brutto
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">
                Forma płatności
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">
                Status
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">
                Akcje
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sortedFaktury.map((faktura) => {
              const disabledRow =
                onlyTransfer && String(faktura.forma_platnosci) !== "6";
              const isKorekta = !!faktura.czy_korekta;

              return (
                <tr
                  key={faktura.id}
                  className={
                    "hover:bg-gray-50 " +
                    (disabledRow ? "opacity-60" : "") +
                    (isKorekta ? " bg-amber-50" : "")
                  }
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.includes(faktura.id)}
                      onChange={() => toggleSelect(faktura.id)}
                      disabled={disabledRow}
                      className="rounded text-blue-600"
                    />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      {faktura.numer_faktury}
                      {isKorekta && (
                        <span className="rounded bg-amber-200 px-1.5 py-0.5 text-xs font-semibold text-amber-800">
                          KOREKTA
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {faktura.kontrahent?.nazwa || "Brak"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {faktura.data_wystawienia
                      ? format(
                          new Date(faktura.data_wystawienia),
                          "dd.MM.yyyy",
                          { locale: pl }
                        )
                      : "-"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={getTerminColor(
                        faktura.termin_platnosci,
                        faktura.status,
                        faktura.forma_platnosci
                      )}
                    >
                      {faktura.termin_platnosci
                        ? format(
                            new Date(faktura.termin_platnosci),
                            "dd.MM.yyyy",
                            { locale: pl }
                          )
                        : "-"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    {Number(faktura.kwota_brutto).toFixed(2)} {faktura.waluta}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {getFormaPlatnosci(faktura.forma_platnosci)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {isKorekta ? (
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${
                          faktura.czy_rozliczona
                            ? "bg-green-100 text-green-800 border-green-200"
                            : "bg-red-100 text-red-800 border-red-200"
                        }`}
                      >
                        {faktura.czy_rozliczona
                          ? "Rozliczona"
                          : "Nierozliczona"}
                      </span>
                    ) : (
                      getStatusBadge(faktura.status)
                    )}
                  </td>
                  <td className="px-4 py-3 space-x-2 whitespace-nowrap text-xs">
                    <Link
                      to={`/faktury/${faktura.id}`}
                      className="text-blue-600 hover:text-blue-900 font-medium"
                    >
                      🔍 Szczegóły
                    </Link>

                    {/* Akcje dla korekt */}
                    {isKorekta && !faktura.czy_rozliczona && (
                      <button
                        onClick={() => handleRozlicz(faktura.id, true)}
                        className="text-green-600 hover:text-green-900 font-medium"
                      >
                        ✅ Rozlicz
                      </button>
                    )}
                    {isKorekta && faktura.czy_rozliczona && (
                      <button
                        onClick={() => handleRozlicz(faktura.id, false)}
                        className="text-orange-600 hover:text-orange-900 font-medium"
                      >
                        ↩️ Cofnij
                      </button>
                    )}

                    {/* Akcje dla zwykłych faktur */}
                    {!isKorekta && faktura.status === "NOWA" && (
                      <button
                        onClick={() => handleMarkPaid(faktura.id)}
                        className="text-purple-600 hover:text-purple-900 font-medium"
                      >
                        💳 Zapłacona
                      </button>
                    )}

                    {!isKorekta && faktura.status === "WYEKSPORTOWANA" && (
                      <>
                        <button
                          onClick={() => handleMarkPaid(faktura.id)}
                          className="text-purple-600 hover:text-purple-900 font-medium"
                        >
                          💳 Zapłacona
                        </button>
                        <button
                          onClick={() => handleRevert(faktura.id)}
                          className="text-orange-600 hover:text-orange-900 font-medium"
                        >
                          ↩️ Cofnij eksport
                        </button>
                      </>
                    )}

                    {!isKorekta && faktura.status === "ZAPLACONA" && (
                      <button
                        onClick={() => handleRevert(faktura.id)}
                        className="text-orange-600 hover:text-orange-900 font-medium"
                      >
                        ↩️ Cofnij
                      </button>
                    )}

                    {disabledRow && (
                      <span className="text-[10px] text-gray-400">
                        Nieprzelew
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}

            {sortedFaktury.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  {filterSearch || filterStatus || sortYear || sortMonth
                    ? "Brak faktur spełniających kryteria"
                    : "Brak faktur"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
