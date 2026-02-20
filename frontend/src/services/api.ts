import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("api_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Kontrahent {
  id: number;
  nazwa: string;
  nip: string;
}

export interface RachunekBankowy {
  id: number;
  iban: string;
  nazwa_banku: string | null;
  status_biala_lista: string | null;
}

export interface Faktura {
  id: number;
  numer_faktury: string;
  numer_ksef: string | null;
  data_wystawienia: string | null;
  termin_platnosci: string | null;
  kwota_netto: number;
  kwota_vat: number;
  kwota_brutto: number;
  waluta: string;
  status: string;
  forma_platnosci: number;
  czy_do_eksportu: boolean;
  kolor: string | null;
  kontrahent: Kontrahent | null;
  rachunek: RachunekBankowy | null;
}

export interface FakturyListResponse {
  items: Faktura[];
  total: number;
}

export const ksefApi = {
  // Autoryzacja
  login: async (apiToken: string) => {
    const response = await api.post("/api/auth/login", {
      api_token: apiToken,
    });
    return response.data;
  },

  me: async () => {
    const response = await api.get("/api/auth/me");
    return response.data;
  },

  logout: async () => {
    const response = await api.post("/api/auth/logout");
    return response.data;
  },

  // Synchronizacja z KSeF
  syncInvoices: async (
    dateFrom?: string,
    dateTo?: string
  ): Promise<{
    success: boolean;
    nowe_faktury: number;
    zaktualizowane: number;
    message: string;
  }> => {
    const params = new URLSearchParams();
    if (dateFrom) params.append("date_from", dateFrom);
    if (dateTo) params.append("date_to", dateTo);

    const response = await api.post(`/api/ksef/sync?${params.toString()}`);
    return response.data;
  },

  // Faktury
  getFaktury: async (): Promise<FakturyListResponse> => {
    const response = await api.get("/api/faktury");
    return response.data;
  },

  verifyFaktura: async (id: number) => {
    const response = await api.post(`/api/faktury/${id}/verify`);
    return response.data;
  },

  updateFakturaStatus: async (id: number, status: string) => {
    const response = await api.patch(`/api/faktury/${id}/status`, null, {
      params: { status },
    });
    return response.data;
  },

  // Eksport
  generateExport: async (ids: number[]) => {
    const response = await api.post("/api/eksport/generate", ids);
    return response.data;
  },

  downloadExport: async (id: number) => {
    const response = await api.get(`/api/eksport/eksport/${id}/download`, {
      responseType: "blob",
    });
    return response.data;
  },

  getExportHistory: async (skip = 0, limit = 50) => {
    const response = await api.get("/api/eksport/history", {
      params: { skip, limit },
    });
    return response.data;
  },

  // Kontrahenci
  getKontrahenci: async (search?: string) => {
    const response = await api.get("/api/kontrahenci", {
      params: { search },
    });
    return response.data;
  },

  // Profil firmy
  getProfileFirma: async () => {
    const response = await api.get("/api/profile/firma");
    return response.data;
  },

  updateProfileFirma: async (payload: {
    firma_nazwa: string | null;
    firma_nip: string | null;
    firma_rachunek: string | null;
    ksef_token: string | null;
  }) => {
    const response = await api.put("/api/profile/firma", payload);
    return response.data;
  },
};

export default api;
