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
  adres?: string;
}

export interface RachunekBankowy {
  id: number;
  iban: string;
  nazwa_banku: string | null;
  status_biala_lista: string | null;
}

export interface PozycjaFaktury {
  id: number;
  numer_pozycji?: number;
  nazwa: string;
  indeks?: string | null;
  kod_cn?: string | null;
  gtu?: string | null;
  ilosc?: number;
  jednostka?: string | null;
  cena_netto?: number;
  rabat?: number | null;
  wartosc_netto?: number;
  stawka_vat?: string;
  kwota_vat?: number;
  wartosc_brutto?: number;
}

export interface KorektyInfo {
  id: number;
  numer: string;
  kwota: number;
  data: string;
  kolor: string | null;
  czy_rozliczona: boolean;
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
  forma_platnosci: string | null;
  opis_platnosci?: string;
  czy_do_eksportu: boolean;
  kolor: string | null;
  czy_korekta?: boolean;
  czy_rozliczona?: boolean;
  faktura_oryginalna_id?: number | null;
  numer_fa_oryginalnej?: string | null;
  kontrahent: Kontrahent | null;
  rachunek: RachunekBankowy | null;
  pozycje?: PozycjaFaktury[];
}

export interface FakturyListResponse {
  items: Faktura[];
  total: number;
}

export interface KontrahentSummary {
  kontrahent_id: number;
  nazwa: string;
  nip: string;
  suma_faktur: number;
  suma_korekt: number;
  korekty_nierozliczone: number;
  saldo: number;
}

export const ksefApi = {
  login: async (username: string, password: string) => {
    const response = await api.post("/api/auth/login", { username, password });
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

  getFaktury: async (): Promise<FakturyListResponse> => {
    const response = await api.get("/api/faktury");
    return response.data;
  },

changePassword: async (current_password: string, new_password: string) => {
  const response = await api.post("/api/auth/change-password", {
    current_password,
    new_password,
  });
  return response.data;
},



  getFaktura: async (id: number): Promise<Faktura> => {
    const response = await api.get(`/api/faktury/${id}`);
    return response.data;
  },

  getKorektyFaktury: async (id: number) => {
    const response = await api.get(`/api/faktury/${id}/korekty`);
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

  rozliczKorekta: async (id: number, rozliczona: boolean) => {
    const response = await api.patch(`/api/faktury/${id}/rozlicz`, null, {
      params: { rozliczona },
    });
    return response.data;
  },

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

  deleteExport: async (id: number) => {
    const response = await api.delete(`/api/eksport/eksport/${id}`);
    return response.data;
  },

  getKontrahenci: async (search?: string) => {
    const response = await api.get("/api/kontrahenci", {
      params: { search },
    });
    return response.data;
  },

  getKontrahenciSummary: async (): Promise<KontrahentSummary[]> => {
    const response = await api.get("/api/faktury/kontrahenci/summary");
    return response.data;
  },

  getProfileFirma: async () => {
    const response = await api.get("/api/profile/me");
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
