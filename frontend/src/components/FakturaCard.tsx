import { CheckCircle, AlertTriangle, Eye } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { ksefApi, Faktura } from "../services/api";
import { PAYMENT_ICONS } from "../services/types";

interface FakturaCardProps {
  faktura: Faktura;
  onToggleSelect: (selected: boolean) => void;
  selected: boolean;
  onVerify?: () => void;
}

export default function FakturaCard({
  faktura,
  onToggleSelect,
  selected,
  onVerify,
}: FakturaCardProps) {
  const [verifying, setVerifying] = useState(false);

  const handleVerify = async () => {
    setVerifying(true);
    try {
      await ksefApi.verifyFaktura(faktura.id);
      toast.success("Rachunek zweryfikowany!");
      onVerify?.();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Błąd weryfikacji");
    } finally {
      setVerifying(false);
    }
  };

  const getColorClass = () => {
    return `faktura-${faktura.kolor} faktura-card`;
  };

  return (
    <div className={getColorClass()}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <label className="relative">
            <input
              type="checkbox"
              checked={selected}
              onChange={(e) => onToggleSelect(e.target.checked)}
              className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
          </label>
          <div className="text-2xl">
            {PAYMENT_ICONS[faktura.forma_platnosci] || "❓"}
          </div>
          <div>
            <h3 className="font-semibold text-lg">{faktura.numer_faktury}</h3>
            <p className="text-sm text-gray-600">
              {faktura.kontrahent?.nazwa ?? "-"}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {faktura.rachunek &&
            faktura.rachunek.status_biala_lista === "ZWERYFIKOWANY" && (
              <CheckCircle className="w-5 h-5 text-green-500" />
            )}
          {faktura.rachunek &&
            faktura.rachunek.status_biala_lista === "NIEZWERYFIKOWANY" && (
              <AlertTriangle className="w-5 h-5 text-orange-500" />
            )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
        <div>
          <span className="text-gray-500">Kwota</span>
          <div className="font-semibold">
            {faktura.kwota_brutto.toLocaleString("pl-PL")} {faktura.waluta}
          </div>
        </div>
        <div>
          <span className="text-gray-500">Termin</span>
          <div>{faktura.termin_platnosci || "-"}</div>
        </div>
        <div>
          <span className="text-gray-500">Status</span>
          <div className="capitalize">{faktura.status}</div>
        </div>
        <div>
          <span className="text-gray-500">Rachunek</span>
          <div className="font-mono text-xs truncate">
            {faktura.rachunek?.iban
              ? `${faktura.rachunek.iban.slice(0, 4)}...${faktura.rachunek.iban.slice(-4)}`
              : "-"}
          </div>
        </div>
      </div>

      <div className="flex space-x-2">
        {faktura.forma_platnosci === 6 && faktura.rachunek && (
          <button
            onClick={handleVerify}
            disabled={
              verifying ||
              faktura.rachunek.status_biala_lista === "ZWERYFIKOWANY"
            }
            className="flex-1 px-3 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-1"
          >
            <Eye className="w-3 h-3" />
            <span>{verifying ? "Weryfikacja..." : "Zweryfikuj"}</span>
          </button>
        )}
      </div>
    </div>
  );
}
