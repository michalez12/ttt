import { useState } from "react";
import { Save } from "lucide-react";
import toast from "react-hot-toast";
import { ksefApi } from "../services/api";

export default function ProfileForm() {
  const [firmaNazwa, setFirmaNazwa] = useState("");
  const [firmaNip, setFirmaNip] = useState("");
  const [firmaRachunek, setFirmaRachunek] = useState("");
  const [ksefToken, setKsefToken] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prosta walidacja – wymagamy rachunku firmy dla eksportu
    if (!firmaRachunek.trim()) {
      toast.error("Podaj rachunek bankowy firmy (IBAN), inaczej eksport nie zadziała.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        firma_nazwa: firmaNazwa || null,
        firma_nip: firmaNip || null,
        firma_rachunek: firmaRachunek || null,
        ksef_token: ksefToken || null,
      };

      const res = await ksefApi.updateProfileFirma(payload);

      toast.success(res.message || "Dane firmowe zapisane");
    } catch (error) {
      console.error("Błąd zapisu profilu:", error);
      toast.error(
        "Błąd zapisu profilu: " +
          (error?.response?.data?.detail || error?.message)
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 max-w-xl">
      <h2 className="text-xl font-semibold mb-2">Profil firmy</h2>
      <p className="text-sm text-gray-500 mb-4">
        Te dane będą użyte przy generowaniu plików przelewów dla banku.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nazwa firmy
          </label>
          <input
            type="text"
            value={firmaNazwa}
            onChange={(e) => setFirmaNazwa(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="np. ACME Sp. z o.o."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            NIP
          </label>
          <input
            type="text"
            value={firmaNip}
            onChange={(e) => setFirmaNip(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="np. 8511005008"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rachunek bankowy (IBAN)
          </label>
          <input
            type="text"
            value={firmaRachunek}
            onChange={(e) => setFirmaRachunek(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="np. PL00 0000 0000 0000 0000 0000 0000"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            Ten rachunek zostanie użyty jako konto nadawcy przelewu w plikach XML.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            KSeF token (opcjonalnie)
          </label>
          <textarea
            value={ksefToken}
            onChange={(e) => setKsefToken(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Wklej token KSeF, jeżeli chcesz go przechowywać w aplikacji"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-gray-400"
          >
            <Save className="w-4 h-4" />
            {saving ? "Zapisywanie..." : "Zapisz profil"}
          </button>
        </div>
      </form>
    </div>
  );
}
