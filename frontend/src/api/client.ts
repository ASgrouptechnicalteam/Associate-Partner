/**
 * Central API client for the Associate Partner Portal.
 * All requests go through here with credentials (cookies) included.
 * The base URL is pulled from VITE_API_URL env var in production,
 * or falls back to '' (same-origin) so the Vite proxy works in dev.
 */

const BASE_URL = (import.meta.env.VITE_API_URL as string) || '';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: 'include',          // always send cookies (httpOnly JWT)
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  // Throw errors instead of hard reloading the SPA
  if (res.status === 401) {
    throw new Error('Unauthorised');
  }

  const data = await res.json().catch(() => ({}));
  
  if (res.status === 403 && (data as any).error === 'FIRST_LOGIN_REQUIRED') {
    throw new Error('FIRST_LOGIN_REQUIRED');
  }

  if (!res.ok) {
    throw new Error((data as { error?: string }).error || `HTTP ${res.status}`);
  }
  return data as T;
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const api = {
  auth: {
    login: (userId: string, password: string) =>
      request<{ success: boolean; isFirstLogin: boolean }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ userId, password }),
      }),
    logout: () =>
      request<void>('/api/auth/logout', { method: 'POST' }),
    me: () =>
      request<{ success: boolean; user: User }>('/api/auth/me'),
    changePassword: (currentPassword: string, newPassword: string) =>
      request<{ success: boolean }>('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      }),
  },

  dashboard: {
    stats: () => request('/api/dashboard/stats'),
    carousel: () => request('/api/dashboard/carousel'),
    offers: () => request('/api/dashboard/offers'),
    announcements: () => request('/api/dashboard/announcements'),
    popup: () => request('/api/dashboard/popup'),
    dismissAnnouncement: (id: string) =>
      request(`/api/dashboard/announcements/${id}/dismiss`, { method: 'POST' }),
  },

  projects: {
    list: () => request('/api/projects'),
    get: (id: string) => request(`/api/projects/${id}`),
    create: (data: unknown) =>
      request('/api/projects', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: unknown) =>
      request(`/api/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) =>
      request(`/api/projects/${id}`, { method: 'DELETE' }),
    assign: (id: string, data: unknown) =>
      request(`/api/projects/${id}/assign`, { method: 'POST', body: JSON.stringify(data) }),
    units: (id: string) => request(`/api/projects/${id}/units`),
    draftPost: (data: unknown) =>
      request('/api/projects/draft', { method: 'POST', body: JSON.stringify(data) }),
    draftPut: (data: unknown) =>
      request('/api/projects/draft', { method: 'PUT', body: JSON.stringify(data) }),
    submit: (id: string) =>
      request(`/api/projects/${id}/submit`, { method: 'POST' }),
  },

  bookings: {
    list: () => request('/api/bookings'),
    get: (id: string) => request(`/api/bookings/${id}`),
    create: (data: unknown) =>
      request('/api/bookings', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: unknown) =>
      request(`/api/bookings/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  },

  commissions: {
    list: () => request('/api/commissions'),
    summary: () => request('/api/commissions/summary'),
  },

  associates: {
    list: () => request('/api/associates'),
    get: (id: string) => request(`/api/associates/${id}`),
    create: (data: unknown) =>
      request('/api/associates', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: unknown) =>
      request(`/api/associates/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    activate: (id: string) =>
      request(`/api/associates/${id}/activate`, { method: 'POST' }),
    deactivate: (id: string) =>
      request(`/api/associates/${id}/deactivate`, { method: 'POST' }),
  },

  approvals: {
    list: () => request('/api/approvals'),
    approve: (id: string) =>
      request(`/api/approvals/${id}/approve`, { method: 'POST' }),
    reject: (id: string, reason: string) =>
      request(`/api/approvals/${id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }),
  },

  team: {
    myTeam: () => request('/api/team'),
  },

  travel: {
    list: () => request('/api/travel'),
    create: (data: unknown) =>
      request('/api/travel', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: unknown) =>
      request(`/api/travel/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  },

  siteVisits: {
    list: () => request('/api/site-visits'),
    create: (data: unknown) =>
      request('/api/site-visits', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: unknown) =>
      request(`/api/site-visits/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  },

  reviews: {
    list: () => request('/api/reviews'),
    stats: () => request('/api/reviews/stats'),
    request: (data: unknown) =>
      request('/api/reviews/request', { method: 'POST', body: JSON.stringify(data) }),
  },

  promotions: {
    list: () => request('/api/promotions'),
    create: (data: unknown) =>
      request('/api/promotions', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: unknown) =>
      request(`/api/promotions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) =>
      request(`/api/promotions/${id}`, { method: 'DELETE' }),
  },

  notifications: {
    list: (unread?: boolean) =>
      request(`/api/notifications${unread ? '?unread=true' : ''}`),
    markRead: (id: string) =>
      request(`/api/notifications/${id}/read`, { method: 'PATCH' }),
    markAllRead: () =>
      request('/api/notifications/read-all', { method: 'PATCH' }),
  },

  profile: {
    get: () => request('/api/profile/me'),
    update: (data: unknown) =>
      request('/api/profile/me', { method: 'PUT', body: JSON.stringify(data) }),
    updateMultipart: (formData: FormData) =>
      fetch(`${BASE_URL}/api/profile/me`, {
        method: 'PUT',
        credentials: 'include',
        body: formData,
      }).then(r => r.json()),
    uploadPhoto: (formData: FormData) =>
      fetch(`${BASE_URL}/api/profile/photo`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      }).then(r => r.json()),
  },

  admin: {
    stats: () => request('/api/admin/stats'),
  },

  dashboardContent: {
    getCarousel: () => request('/api/dashboard/carousel/manage'),
    createCarousel: (data: unknown) =>
      request('/api/dashboard/carousel', { method: 'POST', body: JSON.stringify(data) }),
    updateCarousel: (id: string, data: unknown) =>
      request(`/api/dashboard/carousel/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteCarousel: (id: string) =>
      request(`/api/dashboard/carousel/${id}`, { method: 'DELETE' }),
    getPopup: () => request('/api/dashboard/popup/manage'),
    savePopup: (data: unknown) =>
      request('/api/dashboard/popup', { method: 'POST', body: JSON.stringify(data) }),
  },

  publicFeedback: {
    get: (id: string) => request(`/api/public/feedback/${id}`),
    submit: (id: string, data: unknown) =>
      request(`/api/public/feedback/${id}`, { method: 'POST', body: JSON.stringify(data) }),
  },
};

// ── Types ─────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  userId: string;
  name: string;
  role: 'MD' | 'AM' | 'ASSOCIATE';
  isFirstLogin: boolean;
  isActive: boolean;
  createdAt: string;
  parentAssociateId?: string;
}
