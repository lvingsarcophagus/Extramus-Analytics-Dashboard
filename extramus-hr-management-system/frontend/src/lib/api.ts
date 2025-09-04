// API client utility for frontend-backend communication
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: {
    id: number;
    fullName: string;
    email: string;
    role: 'intern' | 'hr' | 'super_admin';
    department?: string;
    nationality?: string;
  };
}

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = null;
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
    }
  }

  getToken(): string | null {
    if (this.token) return this.token;
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken');
    }
    return null;
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
  }

  async request(endpoint: string, options: RequestOptions = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const config: RequestInit = {
      method: 'GET',
      headers,
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        if (response.status === 401) {
          this.clearToken();
          window.location.href = '/login';
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return response;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication methods
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: any): Promise<LoginResponse> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.clearToken();
    }
  }

  async refreshToken() {
    return this.request('/auth/refresh', { method: 'POST' });
  }

  // User methods
  async getCurrentUser() {
    return this.request('/users/me');
  }

  async getUsers(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/users?${params}`);
  }

  async updateUser(userId: number, data: any) {
    return this.request(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Document methods
  async getDocuments(filters: Record<string, string> = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/documents?${params}`);
  }

  async getDocument(documentId: number) {
    return this.request(`/documents/${documentId}`);
  }

  async uploadDocument(formData: FormData) {
    const token = this.getToken();
    const headers: Record<string, string> = {};
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return fetch(`${this.baseURL}/documents/upload`, {
      method: 'POST',
      headers,
      body: formData,
    }).then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    });
  }

  async updateDocumentStatus(documentId: number, status: string, comments = '') {
    return this.request(`/documents/${documentId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, comments }),
    });
  }

  async deleteDocument(documentId: number) {
    return this.request(`/documents/${documentId}`, {
      method: 'DELETE',
    });
  }

  async downloadDocument(documentId: number) {
    const token = this.getToken();
    const headers: Record<string, string> = {};
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return fetch(`${this.baseURL}/documents/${documentId}/download`, {
      headers,
    });
  }

  // Analytics methods
  async getAnalytics(filters: Record<string, string> = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/analytics?${params}`);
  }

  async getDashboardStats() {
    return this.request('/analytics/dashboard');
  }

  // Notification methods
  async getNotifications() {
    return this.request('/notifications');
  }

  async markNotificationAsRead(notificationId: number) {
    return this.request(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  }

  async markAllNotificationsAsRead() {
    return this.request('/notifications/mark-all-read', {
      method: 'PUT',
    });
  }
}

// Export singleton instance
const apiClient = new ApiClient();
export default apiClient;
