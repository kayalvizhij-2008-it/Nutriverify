/**
 * API client for NutriVerify backend.
 */

function resolveApiBase(): string {
  const envUrl = ((import.meta as any).env?.VITE_API_BASE_URL as string | undefined)?.trim();
  if (!envUrl) return '/api/v1';
  const clean = envUrl.replace(/\/+$/, '');
  return clean.endsWith('/api/v1') ? clean : `${clean}/api/v1`;
}

export const API_BASE = resolveApiBase();

function getToken(): string | null {
  return localStorage.getItem('nv_token');
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || error.message || `Request failed with status ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// Auth
export const authApi = {
  register: (data: { username: string; password: string; fullName?: string }) =>
    request<{ token: string; userId: string; username: string; fullName: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  login: (data: { username: string; password: string }) =>
    request<{ token: string; userId: string; username: string; fullName: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  logout: () => request<void>('/auth/logout', { method: 'POST' }),
};

// Analysis
export interface AnalyzeRequest {
  productName: string;
  brand?: string;
  servingSize?: string;
  ingredients?: { name: string; category: string; note?: string }[];
  claims?: { type: string; displayText: string }[];
  calories: number;
  fat: number;
  saturatedFat?: number;
  transFat?: number;
  sugar: number;
  addedSugar?: number;
  sodium: number;
  protein: number;
  carbs: number;
  fiber: number;
  cholesterol?: number;
  documentId?: number;
}

export interface AllergenFinding {
  allergenName: string;
  matchingIngredients: string[];
}

export interface AnalysisResponse {
  historyId?: number;
  productName: string;
  brand: string;
  servingSize: string;
  calories: number;
  fat: number;
  saturatedFat?: number;
  transFat?: number;
  sugar: number;
  addedSugar?: number;
  sodium: number;
  protein: number;
  carbs: number;
  fiber: number;
  cholesterol?: number;
  authenticityScore: number;
  healthScore: number;
  riskLevel: string;
  claimResults: { claimText: string; claimType: string; verdict: string; reason: string }[];
  ingredients?: { name: string; category?: string; note?: string }[];
  ingredientsText?: string;
  nutritionFacts?: {
    energyKcal?: number;
    proteinG?: number;
    carbohydratesG?: number;
    totalSugarsG?: number;
    dietaryFiberG?: number;
    totalFatG?: number;
    sodiumMg?: number;
  };
  imageUrl?: string;
  category?: string;
  ingredientRisks: { category: string; count: number }[];
  nutritionFindings: { message: string; problematic: boolean }[];
  recommendations: string[];
  insightCards: { type: string; title: string; description: string; severity: string }[];
  allergenFindings: AllergenFinding[];
  confidenceScores: Record<string, number>;
  suggestedQuestions: string[];
  analyzedAt: string;
}

export const analysisApi = {
  analyze: (data: AnalyzeRequest) =>
    request<AnalysisResponse>('/analyze', { method: 'POST', body: JSON.stringify(data) }),
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${getToken()}` },
      body: formData,
    }).then(r => r.json());
  },
};

// History
export const historyApi = {
  getAll: () => request<AnalysisResponse[]>('/history'),
  getById: (id: number) => request<AnalysisResponse>(`/history/${id}`),
  delete: (id: number) => request<void>(`/history/${id}`, { method: 'DELETE' }),
};

// Saved Products
export const savedApi = {
  getAll: () => request<{ id: number; productName: string; brand: string; healthScore: number; authenticityScore: number; riskLevel: string; savedAt: string }[]>('/saved'),
  save: (data: AnalysisResponse) => request<{ id: number }>('/saved', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id: number) => request<void>(`/saved/${id}`, { method: 'DELETE' }),
};

// Compare
export const compareApi = {
  compare: (firstHistoryId: number, secondHistoryId: number) =>
    request<{ productA: string; productB: string; summary: string; metrics: { name: string; productAValue: string; productBValue: string; betterFor: string }[]; recommended: string }>('/compare', {
      method: 'POST',
      body: JSON.stringify({ firstHistoryId, secondHistoryId }),
    }),
};

export interface ChatResponseDto {
  response: string;
  language: string;
  suggestedFollowUps: string[];
  timestamp: string;
  providerType?: string;
  statusLabel?: string;
  contextProductName?: string;
  fallback?: boolean;
}

// Chat (NutriVerify AI)
export const chatApi = {
  send: (message: string, analysisContextId?: number, language?: string) =>
    request<ChatResponseDto>('/chat', {
      method: 'POST',
      body: JSON.stringify({ message, analysisContextId, language }),
    }),
};

// Profile
export interface UserProfile {
  id: string;
  username: string;
  fullName: string;
  totalScansPerformed: number;
  dietaryGoals: string[];
  allergens: string[];
  preferredLanguage: string;
  createdAt: string;
}

export const profileApi = {
  get: () => request<UserProfile>('/profile'),
  update: (data: Partial<UserProfile>) => request<UserProfile>('/profile', { method: 'PUT', body: JSON.stringify(data) }),
  getGoals: () => request<{ dietaryGoals: string[] }>('/goals'),
  updateGoals: (data: { dietaryGoals: string[] }) => request<{ dietaryGoals: string[] }>('/goals', { method: 'PUT', body: JSON.stringify(data) }),
};

// Health & AI status check
export interface AiStatusDto {
  aiConfigured: boolean;
  aiAvailable: boolean;
  provider: string;
  mode: string;
  statusLabel: string;
  ocrConfigured: boolean;
  speechConfigured: boolean;
}

export const healthApi = {
  check: () => request<{ status: string; application: string; version: string }>('/health'),
};

export const aiApi = {
  getStatus: () => request<AiStatusDto>('/ai/status'),
};
