import { useState, useEffect } from "react";
import { Save, KeyRound, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { ksefApi } from "../services/api";

export default function ProfileForm() {
  const [firmaNazwa, setFirmaNazwa] = useState("");
  const [firmaNip, setFirmaNip] = useState("");
  const [firmaRachunek, setFirmaRachunek] = useState("");
  const [ksefToken, setKsefToken] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Zmiana hasła
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await ksefApi.getProfileFirma();
        setFirmaNazwa(data.firma_nazwa || "");
        setFirmaNip(data.firma_nip || "");
        setFirmaRachunek(data.firma_rachunek || "");
      } catch (error) {
        toast.error("Nie udało się wczytać danych profilu");
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firmaRachunek.trim()) {
      toast.error("Podaj rachunek bankowy firmy (IBAN)");
      return;
    }
    setSaving(true);
    try {
      const res = await ksefApi.updateProfileFirma({
        firma_nazwa: firmaNazwa || null,
        firma_nip: firmaNip || null,
        firma_rachunek: firmaRachunek || null,
        ksef_token: ksefToken || null,
      });
      toast.success(res.message || "Dane firmowe zapisane");
      setFirmaNazwa(res.firma_nazwa || "");
      setFirmaNip(res.firma_nip || "");
      setFirmaRachunek(res.firma_rachunek || "");
      setKsefToken("");
    } catch (error: any) {
      toast.error("Błąd zapisu: " + (error?.response?.data?.detail || error?.message));
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Wypełnij wszystkie pola hasła");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Nowe hasło i potwierdzenie nie są zgodne");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Nowe hasło musi mieć co najmniej 6 znaków");
      return;
    }
    if (newPassword === currentPassword) {
      toast.error("Nowe hasło musi być inne niż obecne");
      return;
    }
    setSavingPassword(true);
    try {
      await ksefApi.changePassword(currentPassword, newPassword);
      toast.success("Hasło zostało zmienione ✅");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast.error("Błąd: " + (error?.response?.data?.detail || error?.message));
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6 max-w-xl">
        <p className="text-sm text-gray-500">Wczytywanie danych profilu...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-xl">
      {/* Profil firmy */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-1">Profil firmy</h2>
        <p className="text-sm text-gray-500 mb-4">
          Dane używane przy generowaniu plików przelewów dla banku.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nazwa firmy</label>
            <input
              type="text"
              value={firmaNazwa}
              onChange={e => setFirmaNazwa(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="np. ACME Sp. z o.o."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">NIP</label>
            <input
              type="text"
              value={firmaNip}
              onChange={e => setFirmaNip(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="np. 8511005008"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rachunek bankowy (IBAN)</label>
            <input
              type="text"
              value={firmaRachunek}
              onChange={e => setFirmaRachunek(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="np. PL00 0000 0000 0000 0000 0000 0000"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Konto nadawcy przelewu w plikach XML eksportu.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">KSeF token</label>
            <textarea
              value={ksefToken}
              onChange={e => setKsefToken(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Wklej nowy token KSeF aby go zaktualizować (pozostaw puste aby nie zmieniać)"
            />
            <p className="mt-1 text-xs text-gray-500">
              Token jest zaszyfrowany — pozostaw puste jeśli nie chcesz zmieniać.
            </p>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? "Zapisywanie..." : "Zapisz profil"}
          </button>
        </form>
      </div>

      {/* Zmiana hasła */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center gap-2 mb-1">
          <KeyRound className="h-5 w-5 text-gray-600" />
          <h2 className="text-xl font-semibold">Zmiana hasła</h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Hasło musi mieć co najmniej 6 znaków.
        </p>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Obecne hasło</label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Wpisz obecne hasło"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(p => !p)}
                className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
              >
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nowe hasło</label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Min. 6 znaków"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowNew(p => !p)}
                className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
              >
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {/* Pasek siły hasła */}
            {newPassword && (
              <div className="mt-1.5">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className={`h-1 flex-1 rounded ${
                      newPassword.length >= i * 3
                        ? i <= 1 ? "bg-red-400"
                        : i <= 2 ? "bg-orange-400"
                        : i <= 3 ? "bg-yellow-400"
                        : "bg-green-500"
                        : "bg-gray-200"
                    }`} />
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  {newPassword.length < 6 ? "Za krótkie" : newPassword.length < 9 ? "Słabe" : newPassword.length < 12 ? "Dobre" : "Silne"}
                </p>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Potwierdź nowe hasło</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                confirmPassword && confirmPassword !== newPassword
                  ? "border-red-400 focus:ring-red-400"
                  : confirmPassword && confirmPassword === newPassword
                  ? "border-green-400 focus:ring-green-400"
                  : ""
              }`}
              placeholder="Powtórz nowe hasło"
              autoComplete="new-password"
            />
            {confirmPassword && confirmPassword !== newPassword && (
              <p className="mt-1 text-xs text-red-500">Hasła nie są zgodne</p>
            )}
            {confirmPassword && confirmPassword === newPassword && (
              <p className="mt-1 text-xs text-green-600">Hasła są zgodne ✓</p>
            )}
          </div>
          <button
            type="submit"
            disabled={savingPassword || !currentPassword || !newPassword || newPassword !== confirmPassword}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
          >
            <KeyRound className="w-4 h-4" />
            {savingPassword ? "Zmienianie..." : "Zmień hasło"}
          </button>
        </form>
      </div>
    </div>
  );
}
