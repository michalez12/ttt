import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Token z localStorage
const getToken = () => localStorage.getItem('api_token');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor dla Bearer Token
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Types
export interface Faktura {
  id: number;
  numer_ksef: string;
  numer_faktury: string;
  kontrahent: {
    id: number;
    nazwa: string;
    nip: string;
  };
  rachunek: {
    iban: string;
    bank: string;
    status_biala_lista: string;
  } | null;
  data_wystawienia: string;
  termin_platnosci: string | null;
  kwota_brutto: number;
  waluta: string;
  forma_platnosci: number;
  forma_platnosci_nazwa: string;
  status: string;
  kolor: string;
  czy_do_eksportu: boolean;
}

export interface SyncResponse {
  success: boolean;
  nowe_faktury: number;
  zaktualizowane: number;
  message: string;
}

// API Methods
export const ksefApi = {
  // Synchronizacja z KSeF
  syncInvoices: async (dateFrom?: string, dateTo?: string): Promise<SyncResponse> => {
    const params = new URLSearchParams();
    if (dateFrom) params.append('date_from', dateFrom);
    if (dateTo) params.append('date_to', dateTo);
    
    const response = await api.post(`/api/ksef/sync?${params.toString()}`);
    return response.data;
  },
  
  // Faktury
  getFaktury: async (params?: {
    status?: string;
    forma_platnosci?: number;
    kolor?: string;
    tylko_do_eksportu?: boolean;
    search?: string;
    skip?: number;
    limit?: number;
  }) => {
    const response = await api.get('/api/faktury', { params });
    return response.data;
  },
  
  getFaktura: async (id: number) => {
    const response = await api.get(`/api/faktury/${id}`);
    return response.data;
  },
  
  updateFaktura: async (id: number, data: { status?: string; notatka?: string }) => {
    const response = await api.put(`/api/faktury/${id}`, null, { params: data });
    return response.data;
  },
  
  verifyFaktura: async (id: number) => {
    const response = await api.post(`/api/faktury/${id}/verify`);
    return response.data;
  },
  
  // Eksport
  generateExport: async (fakturaIds: number[]) => {
    const response = await api.post('/api/eksport/generate', { faktura_ids: fakturaIds });
    return response.data;
  },
  
  getExportHistory: async (skip = 0, limit = 50) => {
    const response = await api.get('/api/eksport/history', { params: { skip, limit } });
    return response.data;
  },
  
  downloadExport: async (id: number) => {
    const response = await api.get(`/api/eksport/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },
  
  // Kontrahenci
  getKontrahenci: async (search?: string) => {
    const response = await api.get('/api/kontrahenci', { params: { search } });
    return response.data;
  },
};

export default api;
