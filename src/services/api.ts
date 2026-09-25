import {
  Dress,
  Category,
  Inquiry,
  WebsiteSettings,
  ActivityHistoryItem,
  InquiryStatus,
  DressFilterOptions,
  CustomerRecord,
  FittingAppointment,
  DeliveryDetails,
  RentalRevenueStats
} from '../types';
import { handleLocalRoute } from './localStore';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Helper for HTTP requests with automatic client-store fallback for Netlify free hosting
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('rissee_admin_token');
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  try {
    const res = await fetch(endpoint, {
      ...options,
      headers,
    });

    const contentType = res.headers.get('content-type') || '';

    // If server responded with HTML (e.g. Netlify SPA fallback redirect on /api/*) or 404 or 405 (Method Not Allowed from static CDN)
    if (res.status === 404 || res.status === 405 || contentType.includes('text/html')) {
      return handleLocalRoute<T>(endpoint, options);
    }

    if (!res.ok) {
      if (res.status === 401) {
        localStorage.removeItem('rissee_admin_token');
        localStorage.removeItem('rissee_admin_user');
        window.dispatchEvent(new Event('auth:unauthorized'));
      }

      let errorMsg = 'An error occurred';
      try {
        const errorData = await res.json();
        errorMsg = errorData.error || errorData.message || `Request failed with status ${res.status}`;
      } catch {
        errorMsg = `Server error (${res.status})`;
      }
      throw new Error(errorMsg);
    }

    return res.json();
  } catch (err: any) {
    // If network error (e.g. static Netlify CDN without Express backend)
    if (
      err?.message?.includes('Failed to fetch') ||
      err?.message?.includes('NetworkError') ||
      err?.name === 'TypeError'
    ) {
      return handleLocalRoute<T>(endpoint, options);
    }
    throw err;
  }
}

export const api = {
  // 1. DRESSES
  dresses: {
    async list(filters: DressFilterOptions = {}, includeAdminHidden = false): Promise<{ data: Dress[]; total: number }> {
      const params = new URLSearchParams();
      if (!includeAdminHidden) {
        params.set('published', 'true');
        params.set('archived', 'false');
      }
      if (filters.search) params.set('search', filters.search);
      if (filters.category) params.set('category', filters.category);
      if (filters.availability) params.set('availability', filters.availability);
      if (filters.featuredOnly) params.set('featured', 'true');
      if (filters.size) params.set('size', filters.size);
      if (filters.color) params.set('color', filters.color);
      if (filters.occasion) params.set('occasion', filters.occasion);
      if (filters.minRentalPrice) params.set('minRental', String(filters.minRentalPrice));
      if (filters.maxRentalPrice) params.set('maxRental', String(filters.maxRentalPrice));
      if (filters.sortBy) params.set('sort', filters.sortBy);

      return request<{ data: Dress[]; total: number }>(`/api/dresses?${params.toString()}`);
    },

    async listAdmin(archivedOnly = false): Promise<{ data: Dress[]; total: number }> {
      const params = new URLSearchParams();
      params.set('archived', archivedOnly ? 'true' : 'false');
      return request<{ data: Dress[]; total: number }>(`/api/dresses?${params.toString()}`);
    },

    async getBySlugOrId(slugOrId: string): Promise<Dress> {
      const res = await request<{ data: Dress }>(`/api/dresses/${encodeURIComponent(slugOrId)}`);
      return res.data;
    },

    async create(data: Partial<Dress>): Promise<Dress> {
      const res = await request<{ success: boolean; data: Dress }>('/api/dresses', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return res.data;
    },

    async update(id: string, data: Partial<Dress>): Promise<Dress> {
      const res = await request<{ success: boolean; data: Dress }>(`/api/dresses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return res.data;
    },

    async duplicate(id: string): Promise<Dress> {
      const res = await request<{ success: boolean; data: Dress }>(`/api/dresses/${id}/duplicate`, {
        method: 'POST',
      });
      return res.data;
    },

    async archive(id: string): Promise<Dress> {
      const res = await request<{ success: boolean; data: Dress }>(`/api/dresses/${id}/archive`, {
        method: 'POST',
      });
      return res.data;
    },

    async restore(id: string): Promise<Dress> {
      const res = await request<{ success: boolean; data: Dress }>(`/api/dresses/${id}/restore`, {
        method: 'POST',
      });
      return res.data;
    },

    async delete(id: string): Promise<void> {
      await request<{ success: boolean }>(`/api/dresses/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // 2. CATEGORIES
  categories: {
    async list(): Promise<Category[]> {
      const res = await request<{ data: Category[] }>('/api/categories');
      return res.data;
    },

    async create(data: { name: string; description?: string }): Promise<Category> {
      const res = await request<{ success: boolean; data: Category }>('/api/categories', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return res.data;
    },

    async update(id: string, data: { name?: string; description?: string; archived?: boolean; display_order?: number }): Promise<Category> {
      const res = await request<{ success: boolean; data: Category }>(`/api/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return res.data;
    },

    async delete(id: string): Promise<void> {
      await request<{ success: boolean }>(`/api/categories/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // 3. INQUIRIES & RENTALS
  inquiries: {
    async list(filters: { status?: string; search?: string; event_type?: string; dress_id?: string } = {}): Promise<Inquiry[]> {
      const params = new URLSearchParams();
      if (filters.status) params.set('status', filters.status);
      if (filters.search) params.set('search', filters.search);
      if (filters.event_type) params.set('event_type', filters.event_type);
      if (filters.dress_id) params.set('dress_id', filters.dress_id);

      const res = await request<{ data: Inquiry[] }>(`/api/inquiries?${params.toString()}`);
      return res.data;
    },

    async get(id: string): Promise<Inquiry> {
      const res = await request<{ data: Inquiry }>(`/api/inquiries/${id}`);
      return res.data;
    },

    async create(data: Partial<Inquiry>): Promise<{ success: boolean; message: string; data: Inquiry }> {
      return request('/api/inquiries', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    async update(id: string, data: Partial<Inquiry>): Promise<Inquiry> {
      if (isSupabaseConfigured() && supabase) {
        try {
          await supabase.from('inquiries').update(data).eq('id', id);
        } catch (sErr) {
          console.warn('[Supabase] Error syncing inquiry update:', sErr);
        }
      }

      const res = await request<{ success: boolean; data: Inquiry }>(`/api/inquiries/${encodeURIComponent(id)}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return res.data;
    },

    async updateStatus(id: string, status: InquiryStatus): Promise<Inquiry> {
      if (isSupabaseConfigured() && supabase) {
        try {
          await supabase.from('inquiries').update({ status }).eq('id', id);
        } catch (sErr) {
          console.warn('[Supabase] Error syncing inquiry status:', sErr);
        }
      }

      const res = await request<{ success: boolean; data: Inquiry }>(`/api/inquiries/${encodeURIComponent(id)}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      return res.data;
    },

    async delete(id: string): Promise<void> {
      if (isSupabaseConfigured() && supabase) {
        try {
          const { error } = await supabase.from('inquiries').delete().eq('id', id);
          if (error) {
            console.warn('[Supabase] Failed to delete inquiry from remote table:', error);
          }
        } catch (sErr) {
          console.warn('[Supabase] Error deleting inquiry record:', sErr);
        }
      }

      await request<{ success: boolean; message?: string }>(`/api/inquiries/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
    },
  },

  // 4. RESERVATIONS
  rentals: {
    async list(): Promise<any[]> {
      const res = await request<{ data: any[] }>('/api/admin/rentals');
      return res.data;
    }
  },

  // 5. CUSTOMERS
  customers: {
    async list(): Promise<CustomerRecord[]> {
      const res = await request<{ data: CustomerRecord[] }>('/api/admin/customers');
      return res.data;
    }
  },

  // 6. MEASUREMENTS
  measurements: {
    async list(): Promise<any[]> {
      const res = await request<{ data: any[] }>('/api/admin/measurements');
      return res.data;
    }
  },

  // 7. FITTING APPOINTMENTS
  fittings: {
    async list(): Promise<FittingAppointment[]> {
      const res = await request<{ data: FittingAppointment[] }>('/api/admin/fittings');
      return res.data;
    },
    async update(id: string, data: Partial<FittingAppointment>): Promise<any> {
      const res = await request<{ success: boolean; data: any }>(`/api/admin/fittings/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return res.data;
    }
  },

  // 8. DELIVERIES
  deliveries: {
    async list(): Promise<DeliveryDetails[]> {
      const res = await request<{ data: DeliveryDetails[] }>('/api/admin/deliveries');
      return res.data;
    },
    async update(id: string, data: any): Promise<any> {
      const res = await request<{ success: boolean; data: any }>(`/api/admin/deliveries/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return res.data;
    }
  },

  // 9. PAYMENTS
  payments: {
    async list(): Promise<any[]> {
      const res = await request<{ data: any[] }>('/api/admin/payments');
      return res.data;
    },
    async update(id: string, data: any): Promise<any> {
      const res = await request<{ success: boolean; data: any }>(`/api/admin/payments/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return res.data;
    }
  },

  // 10. RENTAL REVENUE
  revenue: {
    async get(filters: { date_range?: string; dress_id?: string; customer?: string; payment_method?: string; delivery_type?: string } = {}): Promise<{
      stats: RentalRevenueStats;
      transactions: any[];
    }> {
      const params = new URLSearchParams();
      if (filters.date_range) params.set('date_range', filters.date_range);
      if (filters.dress_id) params.set('dress_id', filters.dress_id);
      if (filters.customer) params.set('customer', filters.customer);
      if (filters.payment_method) params.set('payment_method', filters.payment_method);
      if (filters.delivery_type) params.set('delivery_type', filters.delivery_type);

      return request(`/api/admin/revenue?${params.toString()}`);
    }
  },

  // 11. PHOTOS
  photos: {
    async list(): Promise<any[]> {
      const res = await request<{ data: any[] }>('/api/admin/photos');
      return res.data;
    },
    async delete(filename: string): Promise<void> {
      await request(`/api/admin/photos/${encodeURIComponent(filename)}`, {
        method: 'DELETE',
      });
    }
  },

  // 12. WEBSITE SETTINGS
  settings: {
    async get(): Promise<WebsiteSettings> {
      const res = await request<{ data: WebsiteSettings }>('/api/settings');
      return res.data;
    },

    async update(data: Partial<WebsiteSettings>): Promise<WebsiteSettings> {
      const res = await request<{ success: boolean; data: WebsiteSettings }>('/api/settings', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return res.data;
    },
  },

  // 13. ACTIVITY HISTORY
  history: {
    async list(params: { action?: string; entity_type?: string; limit?: number } = {}): Promise<{ data: ActivityHistoryItem[]; total: number }> {
      const q = new URLSearchParams();
      if (params.action) q.set('action', params.action);
      if (params.entity_type) q.set('entity_type', params.entity_type);
      if (params.limit) q.set('limit', String(params.limit));

      return request<{ data: ActivityHistoryItem[]; total: number }>(`/api/history?${q.toString()}`);
    },
  },

  // 14. STATS
  stats: {
    async get(): Promise<any> {
      const res = await request<{ data: any }>('/api/stats');
      return res.data;
    },
  },

  // 15. UPLOAD
  uploadPhotos: async (formData: FormData): Promise<{ id: string; url: string; is_primary: boolean }[]> => {
    const token = localStorage.getItem('rissee_admin_token');
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers,
        body: formData,
      });

      const contentType = res.headers.get('content-type') || '';
      if (res.ok && !contentType.includes('text/html')) {
        const data = await res.json();
        return data.data;
      }
    } catch {
      // Fall through to client data URL conversion
    }

    // Client-side fallback for Netlify static hosting (convert files to Data URLs)
    const files = formData.getAll('photos') as File[];
    if (files.length > 0) {
      const uploads = await Promise.all(
        files.map((file, idx) => {
          return new Promise<{ id: string; url: string; is_primary: boolean }>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              resolve({
                id: 'img-' + Date.now() + '-' + idx,
                url: reader.result as string,
                is_primary: idx === 0,
              });
            };
            reader.readAsDataURL(file);
          });
        })
      );
      return uploads;
    }

    return [{
      id: 'img-' + Date.now(),
      url: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1000&q=80',
      is_primary: true
    }];
  },

  // 16. AUTH
  auth: {
    async login(usernameOrEmail: string, password: string): Promise<{ success: boolean; token: string; user: any }> {
      const trimmed = usernameOrEmail.trim();
      const res = await request<{ success: boolean; token: string; user: any }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          username: trimmed,
          email: trimmed,
          password,
        }),
      });
      if (res.token) {
        localStorage.setItem('rissee_admin_token', res.token);
        localStorage.setItem('rissee_admin_user', JSON.stringify(res.user));
      }
      return res;
    },

    logout(): void {
      localStorage.removeItem('rissee_admin_token');
      localStorage.removeItem('rissee_admin_user');
    },

    getCurrentUser(): any | null {
      const userStr = localStorage.getItem('rissee_admin_user');
      if (!userStr) return null;
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    },

    isAuthenticated(): boolean {
      return Boolean(localStorage.getItem('rissee_admin_token'));
    },

    async changePassword(currentPassword: string, newPassword: string): Promise<void> {
      await request('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
    },

    async updatePassword(newPassword: string, currentPassword?: string): Promise<void> {
      return this.changePassword(currentPassword || 'munchkin0603#', newPassword);
    },
  },

  // 17. UPLOADS WRAPPER
  uploads: {
    async upload(formData: FormData): Promise<{ id: string; url: string; is_primary: boolean }[]> {
      return api.uploadPhotos(formData);
    },

    async single(file: File): Promise<{ id: string; url: string; is_primary: boolean }> {
      const formData = new FormData();
      formData.append('photos', file);
      const results = await api.uploadPhotos(formData);
      return results[0] || { id: 'img-' + Date.now(), url: URL.createObjectURL(file), is_primary: true };
    },
  },

  // 18. NETLIFY AUTOMATED DEPLOYMENT
  netlify: {
    async deploy(token: string, siteName?: string): Promise<{ success: boolean; site_name: string; url: string; deploy_id: string }> {
      return request<{ success: boolean; site_name: string; url: string; deploy_id: string }>('/api/admin/deploy-netlify', {
        method: 'POST',
        body: JSON.stringify({ token, siteName }),
      });
    },
  },
};
