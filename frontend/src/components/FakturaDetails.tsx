import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ksefApi, Faktura } from "../services/api";

const FORMY_PLATNOSCI: Record<string, string> = {
  "1": "💵 Gotówka",
  "2": "💳 Karta",
  "4": "📄 Czek",
  "6": "🏦 Przelew",
  "8": "❔ Inna",
};

export default function FakturaDetails() {
  const { id } = useParams();
  const [faktura, setFaktura] = useState<Faktura | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await ksefApi.getFaktura(Number(id));
      setFaktura(data);
    } catch (e) {
      console.error("Błąd pobierania faktury", e);
      setFaktura(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleRozlicz = async (rozliczona: boolean) => {
    if (!faktura) return;
    try {
      setSaving(true);
      await ksefApi.rozliczKorekta(faktura.id, rozliczona);
      await load();
    } catch (e) {
      console.error("Błąd rozliczania korekty", e);
    } finally {
      setSaving(false);
    }
  };

  const handleStatus = async (status: string) => {
    if (!faktura) return;
    try {
      setSaving(true);
      await ksefApi.updateFakturaStatus(faktura.id, status);
      await load();
    } catch (e) {
      console.error("Błąd zmiany statusu", e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-4 text-gray-500">Ładowanie faktury...</div>;
  if (!faktura) return <div className="p-4 text-red-500">Nie znaleziono faktury.</div>;

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">
          Faktura {faktura.numer_faktury}
          {faktura.czy_korekta && (
            <span className="ml-2 rounded bg-amber-100 px-2 py-0.5 text-sm font-medium text-amber-800">
              KOREKTA
            </span>
          )}
        </h1>
        <Link to="/faktury" className="text-sm text-blue-600 hover:underline">
          ← Powrót do listy
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Dane faktury */}
        <div className="rounded border bg-white p-4">
          <h2 className="mb-2 text-sm font-semibold text-gray-700">Dane faktury</h2>
          <p><span className="text-gray-500">Numer KSeF:</span> {faktura.numer_ksef || "-"}</p>
          <p><span className="text-gray-500">Data wystawienia:</span> {faktura.data_wystawienia || "-"}</p>
          <p><span className="text-gray-500">Termin płatności:</span> {faktura.termin_platnosci || "-"}</p>
          <p>
            <span className="text-gray-500">Forma płatności:</span>{" "}
            {FORMY_PLATNOSCI[String(faktura.forma_platnosci)] || `Kod: ${faktura.forma_platnosci ?? "-"}`}
          </p>
          <p><span className="text-gray-500">Status:</span> {faktura.status}</p>
          <p className="mt-1 font-medium">
            Kwota brutto: {faktura.kwota_brutto.toFixed(2)} {faktura.waluta}
          </p>
          <p>
            <span className="text-gray-500">Netto:</span> {faktura.kwota_netto.toFixed(2)}{" "}
            | <span className="text-gray-500">VAT:</span> {faktura.kwota_vat.toFixed(2)}
          </p>

          {/* Sekcja korekty */}
          {faktura.czy_korekta && (
            <div className="mt-3 rounded bg-amber-50 border border-amber-200 p-3">
              <p className="text-sm font-semibold text-amber-800">
                Korekta {faktura.numer_fa_oryginalnej ? `do: ${faktura.numer_fa_oryginalnej}` : ""}
              </p>
              <p className="text-sm text-amber-700 mt-1">
                Status:{" "}
                <span className={faktura.czy_rozliczona ? "text-green-700 font-semibold" : "text-red-700 font-semibold"}>
                  {faktura.czy_rozliczona ? "Rozliczona" : "Nierozliczona"}
                </span>
              </p>
              <div className="mt-2 flex gap-2">
                {!faktura.czy_rozliczona ? (
                  <button
                    onClick={() => handleRozlicz(true)}
                    disabled={saving}
                    className="rounded bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    {saving ? "Zapisuję..." : "Oznacz jako rozliczoną"}
                  </button>
                ) : (
                  <button
                    onClick={() => handleRozlicz(false)}
                    disabled={saving}
                    className="rounded bg-gray-400 px-3 py-1 text-xs font-medium text-white hover:bg-gray-500 disabled:opacity-50"
                  >
                    {saving ? "Zapisuję..." : "Cofnij rozliczenie"}
                  </button>
                )}
              </div>
            </div>
          )}

         {/* Zmiana statusu dla zwykłych faktur */}
{!faktura.czy_korekta && (
  <div className="mt-3 flex flex-wrap gap-2">
    {faktura.status !== "ZAPLACONA" && (
      <button
        onClick={() => handleStatus("ZAPLACONA")}
        disabled={saving}
        className="rounded bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
      >
        {saving ? "Zapisuję..." : "Oznacz jako zapłaconą"}
      </button>
    )}

    {faktura.status === "WYEKSPORTOWANA" && (
      <button
        onClick={() => handleStatus("NOWA")}
        disabled={saving}
        className="rounded bg-orange-500 px-3 py-1 text-xs font-medium text-white hover:bg-orange-600 disabled:opacity-50"
      >
        {saving ? "Zapisuję..." : "↩️ Cofnij eksport"}
      </button>
    )}

    {faktura.status === "ZAPLACONA" && (
      <button
        onClick={() => handleStatus("NOWA")}
        disabled={saving}
        className="rounded bg-gray-400 px-3 py-1 text-xs font-medium text-white hover:bg-gray-500 disabled:opacity-50"
      >
        {saving ? "Zapisuję..." : "Cofnij status"}
      </button>
    )}
  </div>
)}
        </div>

        {/* Kontrahent i rachunek */}
        <div className="rounded border bg-white p-4">
          <h2 className="mb-2 text-sm font-semibold text-gray-700">Kontrahent</h2>
          {faktura.kontrahent ? (
            <>
              <p className="font-medium">{faktura.kontrahent.nazwa}</p>
              <p className="text-sm text-gray-600">NIP: {faktura.kontrahent.nip}</p>
              <p className="text-sm text-gray-600">{faktura.kontrahent.adres}</p>
            </>
          ) : (
            <p className="text-sm text-gray-500">Brak danych kontrahenta.</p>
          )}

          <h2 className="mt-4 mb-2 text-sm font-semibold text-gray-700">Rachunek bankowy</h2>
          {faktura.rachunek ? (
            <>
              <p className="text-sm font-mono break-all">{faktura.rachunek.iban}</p>
              <p className="text-sm text-gray-600">Bank: {faktura.rachunek.nazwa_banku || "-"}</p>
              <p className="text-sm">
                Biała lista:{" "}
                <span className={
                  faktura.rachunek.status_biala_lista === "Tak" || faktura.rachunek.status_biala_lista === "ZWERYFIKOWANY"
                    ? "text-green-600 font-medium"
                    : faktura.rachunek.status_biala_lista === "PENDING"
                    ? "text-yellow-600 font-medium"
                    : "text-red-600 font-medium"
                }>
                  {faktura.rachunek.status_biala_lista || "-"}
                </span>
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-500">Brak rachunku.</p>
          )}
        </div>
      </div>

      {/* Pozycje faktury */}
      <div className="rounded border bg-white p-4">
        <h2 className="mb-3 text-sm font-semibold text-gray-700">
          Pozycje faktury{" "}
          {faktura.pozycje && faktura.pozycje.length > 0 && (
            <span className="text-gray-400 font-normal">({faktura.pozycje.length} poz.)</span>
          )}
        </h2>
        {faktura.pozycje && faktura.pozycje.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-xs uppercase text-gray-500">
                  <th className="py-2 px-2 text-left">Lp.</th>
                  <th className="py-2 px-2 text-left">Nazwa</th>
                  <th className="py-2 px-2 text-left">Indeks</th>
                  <th className="py-2 px-2 text-left">GTU</th>
                  <th className="py-2 px-2 text-right">Ilość</th>
                  <th className="py-2 px-2 text-left">Jedn.</th>
                  <th className="py-2 px-2 text-right">Cena netto</th>
                  <th className="py-2 px-2 text-right">Rabat</th>
                  <th className="py-2 px-2 text-right">Wart. netto</th>
                  <th className="py-2 px-2 text-right">VAT %</th>
                  <th className="py-2 px-2 text-right">Kwota VAT</th>
                  <th className="py-2 px-2 text-right">Wart. brutto</th>
                </tr>
              </thead>
              <tbody>
                {faktura.pozycje.map((p, idx) => (
                  <tr key={p.id} className="border-b last:border-b-0 hover:bg-gray-50">
                    <td className="py-1.5 px-2 text-gray-400">{p.numer_pozycji ?? idx + 1}</td>
                    <td className="py-1.5 px-2 font-medium">{p.nazwa}</td>
                    <td className="py-1.5 px-2 text-gray-500 text-xs">{p.indeks ?? "-"}</td>
                    <td className="py-1.5 px-2">
                      {p.gtu ? (
                        <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs text-blue-700">{p.gtu}</span>
                      ) : "-"}
                    </td>
                    <td className="py-1.5 px-2 text-right">{p.ilosc ?? "-"}</td>
                    <td className="py-1.5 px-2 text-gray-500">{p.jednostka ?? "-"}</td>
                    <td className="py-1.5 px-2 text-right">{p.cena_netto != null ? p.cena_netto.toFixed(2) : "-"}</td>
                    <td className="py-1.5 px-2 text-right text-orange-600">
                      {p.rabat != null && p.rabat !== 0 ? p.rabat.toFixed(2) : "-"}
                    </td>
                    <td className="py-1.5 px-2 text-right">{p.wartosc_netto != null ? p.wartosc_netto.toFixed(2) : "-"}</td>
                    <td className="py-1.5 px-2 text-right text-gray-500">{p.stawka_vat ?? "-"}%</td>
                    <td className="py-1.5 px-2 text-right">{p.kwota_vat != null ? p.kwota_vat.toFixed(2) : "-"}</td>
                    <td className="py-1.5 px-2 text-right font-semibold">{p.wartosc_brutto != null ? p.wartosc_brutto.toFixed(2) : "-"}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 bg-gray-50">
                <tr>
                  <td colSpan={8} className="py-1.5 px-2 text-right text-xs font-medium text-gray-500 uppercase">Suma:</td>
                  <td className="py-1.5 px-2 text-right font-medium">
                    {faktura.pozycje.reduce((s, p) => s + (p.wartosc_netto ?? 0), 0).toFixed(2)}
                  </td>
                  <td></td>
                  <td className="py-1.5 px-2 text-right font-medium">
                    {faktura.pozycje.reduce((s, p) => s + (p.kwota_vat ?? 0), 0).toFixed(2)}
                  </td>
                  <td className="py-1.5 px-2 text-right font-semibold">
                    {faktura.pozycje.reduce((s, p) => s + (p.wartosc_brutto ?? 0), 0).toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-500">Brak pozycji.</p>
        )}
      </div>
    </div>
  );
}
