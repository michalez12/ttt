import { useState, useEffect } from "react";
import { Upload, Filter, FileCheck } from "lucide-react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import toast from "react-hot-toast";
import { ksefApi, Faktura, FakturyListResponse } from "../services/api";

export default function FakturyList() {
  const [faktury, setFaktury] = useState<Faktura[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number[]>([]);
  const [exporting, setExporting] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Filtry
  const [filterStatus, setFilterStatus] = useState("");
  const [filterSearch, setFilterSearch] = useState("");
  const [sortYear, setSortYear] = useState("");
  const [sortMonth, setSortMonth] = useState("");
  const [sortDirection, setSortDirection] = useState<"none" | "asc" | "desc">(
    "desc"
  );
  const [onlyTransfer, setOnlyTransfer] = useState(false); // tylko przelew

  const currentYear = new Date().getFullYear();
  const availableYears: number[] = [];
  for (let y = 2026; y <= currentYear + 1; y++) {
    availableYears.push(y);
  }

  useEffect(() => {
    loadFaktury();
  }, []);

  const loadFaktury = async () => {
    try {
      setLoading(true);
      const data: FakturyListResponse = await ksefApi.getFaktury();
      setFaktury(data.items || []);
    } catch (error: any) {
      console.error("Błąd ładowania faktur:", error);
      toast.error("Błąd ładowania faktur");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile) {
      toast.error("Wybierz plik XML");
      return;
    }
    setUploading(true);
    try {
      toast.error("Import XML nie jest jeszcze zaimplementowany.");
    } catch (error: any) {
      toast.error(
        "Błąd importu: " +
          (error?.response?.data?.detail || error?.message)
      );
    } finally {
      setUploading(false);
    }
  };

  const handleVerify = async (id: number) => {
    try {
      await ksefApi.verifyFaktura(id);
      toast.success("Rachunek zweryfikowany!");

      setFaktury((prev) =>
        prev.map((f) =>
          f.id === id && f.rachunek
            ? {
                ...f,
                rachunek: {
                  ...f.rachunek,
                  status_biala_lista: "ZWERYFIKOWANY",
                },
              }
            : f
        )
      );
    } catch {
      toast.error("Błąd weryfikacji");
    }
  };

  const handleMarkPaid = async (id: number) => {
    try {
      await ksefApi.updateFakturaStatus(id, "ZAPLACONA");
      toast.success("Faktura oznaczona jako zapłacona");

      setFaktury((prev) =>
        prev.map((f) =>
          f.id === id
            ? {
                ...f,
                status: "ZAPLACONA",
              }
            : f
        )
      );
    } catch {
      toast.error("Błąd aktualizacji statusu");
    }
  };

  const handleRevert = async (id: number, previousStatus?: string) => {
    const confirmed = window.confirm(
      "Czy na pewno chcesz cofnąć status tej faktury do NOWA?"
    );
    if (!confirmed) return;

    const newStatus = previousStatus || "NOWA";
    try {
      await ksefApi.updateFakturaStatus(id, newStatus);
      toast.success(`Status zmieniony na ${newStatus}`);

      setFaktury((prev) =>
        prev.map((f) =>
          f.id === id
            ? {
                ...f,
                status: newStatus,
              }
            : f
        )
      );
    } catch {
      toast.error("Błąd cofania statusu");
    }
  };

  const handleExport = async () => {
    if (selected.length === 0) {
      toast.error("Wybierz co najmniej jedną fakturę");
      return;
    }

    const wybraneFaktury = faktury.filter((f) => selected.includes(f.id));
    console.log("WYBRANE DO EKSPORTU:", wybraneFaktury);

    const nieDoEksportu = wybraneFaktury.filter(
      (f) => f.forma_platnosci !== 6
    );

    if (nieDoEksportu.length > 0) {
      const numery = nieDoEksportu
        .map((f) => f.numer_faktury)
        .join(", ");
      toast.error(
        `Te faktury nie mogą być wyeksportowane (forma płatności ≠ przelew): ${numery}`
      );
      return;
    }

    console.log("Eksport – wysyłane ID:", selected);

    setExporting(true);
    try {
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
      console.error("Błąd eksportu (pełny):", error);
      console.error("Błąd eksportu response.data:", error?.response?.data);
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
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const eksportowalne = sortedFaktury.filter(
      (f) => !onlyTransfer || f.forma_platnosci === 6
    );
    if (selected.length === eksportowalne.length) {
      setSelected([]);
    } else {
      setSelected(eksportowalne.map((f) => f.id));
    }
  };

  const getTerminColor = (
    termin: string | null,
    status: string,
    forma_platnosci: number
  ) => {
    if (status === "ZAPLACONA") return "text-gray-500";
    if (forma_platnosci === 1 || forma_platnosci === 2)
      return "text-gray-500";
    if (status !== "NOWA") return "text-gray-500";
    if (!termin) return "text-gray-500";

    const today = new Date();
    const terminDate = new Date(termin);
    const diffDays = Math.ceil(
      (terminDate.getTime() - today.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    if (diffDays < 0) return "text-red-600 font-bold";
    if (diffDays <= 3) return "text-orange-600 font-semibold";
    if (diffDays <= 7) return "text-yellow-600";

    return "text-green-600";
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      NOWA: "bg-blue-100 text-blue-800 border border-blue-200",
      WYEKSPORTOWANA:
        "bg-green-100 text-green-800 border border-green-200",
      ZAPLACONA:
        "bg-purple-100 text-purple-800 border border-purple-200",
    };

    const cls =
      styles[status] ||
      "bg-gray-100 text-gray-800 border border-gray-200";

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${cls}`}>
        {status}
      </span>
    );
  };

  const getFormaPlatnosci = (kod: number) => {
    const formy: Record<
      number,
      { label: string; color: string; emoji: string }
    > = {
      1: {
        label: "Gotówka",
        color: "bg-gray-100 text-gray-800",
        emoji: "💵",
      },
      2: {
        label: "Karta",
        color: "bg-blue-100 text-blue-800",
        emoji: "💳",
      },
      6: {
        label: "Przelew",
        color: "bg-indigo-100 text-indigo-800",
        emoji: "🏦",
      },
      4: {
        label: "Czek",
        color: "bg-yellow-100 text-yellow-800",
        emoji: "📝",
      },
      8: {
        label: "Inna",
        color: "bg-gray-100 text-gray-800",
        emoji: "❓",
      },
    };

    const forma =
      formy[kod] || {
        label: "Nieznana",
        color: "bg-gray-100 text-gray-800",
        emoji: "❓",
      };

    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${forma.color}`}
      >
        <span>{forma.emoji}</span>
        <span>{forma.label}</span>
      </span>
    );
  };

  const filteredFaktury = faktury.filter((f) => {
    if (filterStatus && f.status !== filterStatus) return false;

    if (filterSearch) {
      const search = filterSearch.toLowerCase();
      if (
        !(
          f.numer_faktury?.toLowerCase().includes(search) ||
          f.kontrahent?.nazwa?.toLowerCase().includes(search)
        )
      ) {
        return false;
      }
    }

    if (sortYear && f.data_wystawienia) {
      const year = new Date(f.data_wystawienia)
        .getFullYear()
        .toString();
      if (year !== sortYear) return false;
    }

    if (sortMonth && f.data_wystawienia) {
      const month = (
        new Date(f.data_wystawienia).getMonth() + 1
      ).toString();
      if (month !== sortMonth) return false;
    }

    return true;
  });

  const sortedFaktury = [...filteredFaktury].sort((a, b) => {
    if (sortDirection === "none") return 0;

    const da = a.data_wystawienia ? new Date(a.data_wystawienia) : null;
    const db = b.data_wystawienia ? new Date(b.data_wystawienia) : null;

    if (!da && !db) return 0;
    if (!da) return 1;
    if (!db) return -1;

    const diff = da.getTime() - db.getTime();
    return sortDirection === "asc" ? diff : -diff;
  });

  // przy włączeniu onlyTransfer odznacz nie-przelewowe z selected
  const visibleEksportowalne = sortedFaktury.filter(
    (f) => !onlyTransfer || f.forma_platnosci === 6
  );
  const visibleIds = new Set(visibleEksportowalne.map((f) => f.id));
  const selectedVisible = selected.filter((id) => visibleIds.has(id));

  if (selectedVisible.length !== selected.length) {
    setSelected(selectedVisible);
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        Ładowanie faktur...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Główny panel nagłówka + akcje */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-semibold mb-1">Faktury</h2>
            <p className="text-sm text-gray-500">
              Lista faktur pobranych z KSeF oraz zaimportowanych z
              plików XML.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Import XML */}
            <div className="flex items-center gap-2">
              <input
                id="file-upload"
                type="file"
                accept=".xml"
                onChange={(e) =>
                  setUploadFile(
                    e.target.files ? e.target.files[0] : null
                  )
                }
                className="hidden"
              />
              <label
                htmlFor="file-upload"
                className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Wybierz XML</span>
              </label>
              {uploadFile && (
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="truncate max-w-[160px]">
                    {uploadFile.name}
                  </span>
                  <button
                    onClick={() => {
                      setUploadFile(null);
                      const el = document.getElementById(
                        "file-upload"
                      ) as HTMLInputElement | null;
                      if (el) el.value = "";
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Usuń
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded-md text-xs hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    {uploading ? "Importowanie..." : "Import"}
                  </button>
                </div>
              )}
            </div>

            {/* Eksport XML */}
            <button
              onClick={handleExport}
              disabled={exporting || selected.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <FileCheck className="w-4 h-4" />
              <span>
                {exporting
                  ? "Generowanie..."
                  : `Generuj XML (${selected.length})`}
              </span>
            </button>
          </div>
        </div>

        {/* Filtry */}
        <div className="flex flex-wrap items-center gap-3 mt-2">
          <div className="flex items-center gap-2 flex-1 min-w-[220px]">
            <input
              type="text"
              placeholder="Szukaj po numerze lub kontrahencie..."
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex itemscenter gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={sortYear}
              onChange={(e) => setSortYear(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Wszystkie miesiące</option>
              <option value="1">Styczeń</option>
              <option value="2">Luty</option>
              <option value="3">Marzec</option>
              <option value="4">Kwiecień</option>
              <option value="5">Maj</option>
              <option value="6">Czerwiec</option>
              <option value="7">Lipiec</option>
              <option value="8">Sierpień</option>
              <option value="9">Wrzesień</option>
              <option value="10">Październik</option>
              <option value="11">Listopad</option>
              <option value="12">Grudzień</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Wszystkie statusy</option>
              <option value="NOWA">Nowe</option>
              <option value="WYEKSPORTOWANA">Wyeksportowane</option>
              <option value="ZAPLACONA">Zapłacone</option>
            </select>
            <label className="flex items-center gap-2 text-xs text-gray-700">
              <input
                type="checkbox"
                checked={onlyTransfer}
                onChange={(e) => setOnlyTransfer(e.target.checked)}
                className="rounded text-blue-600"
              />
              <span>Tylko przelew do eksportu</span>
            </label>

            {(filterSearch ||
              filterStatus ||
              sortYear ||
              sortMonth ||
              sortDirection !== "desc" ||
              onlyTransfer) && (
              <button
                onClick={() => {
                  setFilterSearch("");
                  setFilterStatus("");
                  setSortYear("");
                  setSortMonth("");
                  setSortDirection("desc");
                  setOnlyTransfer(false);
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
              >
                Wyczyść
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabela faktur */}
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
                  type="button"
                  onClick={() =>
                    setSortDirection((prev) =>
                      prev === "desc"
                        ? "asc"
                        : prev === "asc"
                        ? "none"
                        : "desc"
                    )
                  }
                  className="inline-flex items-center gap-1"
                >
                  <span>Data wystawienia</span>
                  <span className="text-xs text-gray-400">
                    {sortDirection === "desc" && "↓"}
                    {sortDirection === "asc" && "↑"}
                    {sortDirection === "none" && "-"}
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
                onlyTransfer && faktura.forma_platnosci !== 6;

              return (
                <tr
                  key={faktura.id}
                  className={
                    "hover:bg-gray-50 " +
                    (disabledRow ? "opacity-60" : "")
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
                    {faktura.numer_faktury}
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
                    {Number(faktura.kwota_brutto).toFixed(2)}{" "}
                    {faktura.waluta}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {getFormaPlatnosci(faktura.forma_platnosci)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {getStatusBadge(faktura.status)}
                  </td>
                  <td className="px-4 py-3 space-x-2 whitespace-nowrap text-xs">
                    {faktura.rachunek &&
                      faktura.status === "NOWA" && (
                        <button
                          onClick={() => handleVerify(faktura.id)}
                          className="text-green-600 hover:text-green-900 font-medium"
                        >
                          ✓ Weryfikuj
                        </button>
                      )}
                    {(faktura.status === "NOWA" ||
                      faktura.status === "WYEKSPORTOWANA") && (
                      <button
                        onClick={() => handleMarkPaid(faktura.id)}
                        className="text-purple-600 hover:text-purple-900 font-medium"
                      >
                        💳 Zapłacona
                      </button>
                    )}
                    {faktura.status === "ZAPLACONA" && (
                      <button
                        onClick={() => handleRevert(faktura.id, "NOWA")}
                        className="text-orange-600 hover:text-orange-900 font-medium"
                      >
                        ↩️ Cofnij
                      </button>
                    )}
                    {disabledRow && (
                      <span className="ml-2 text-[10px] text-gray-500">
                        Nieprzelew – poza eksportem
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
                  {filterSearch ||
                  filterStatus ||
                  sortYear ||
                  sortMonth
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
