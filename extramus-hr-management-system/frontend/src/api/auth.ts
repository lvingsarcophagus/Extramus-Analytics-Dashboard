import apiClient from './client';
import { 
  User, 
  LoginForm, 
  RegisterForm, 
  ProfileUpdateForm,
  ApiResponse 
} from '@/types';

export const authApi = {
  // Login user
  async login(credentials: LoginForm): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await apiClient.post('/auth/login', credentials);
    
    if (response.token) {
      apiClient.setAuthToken(response.token);
    }
    
    return response;
  },

  // Register new user
  async register(userData: RegisterForm): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await apiClient.post('/auth/register', userData);
    
    if (response.token) {
      apiClient.setAuthToken(response.token);
    }
    
    return response;
  },

  // Get current user profile
  async getProfile(): Promise<ApiResponse<{ user: User }>> {
    return apiClient.get('/auth/profile');
  },

  // Update user profile
  async updateProfile(data: ProfileUpdateForm): Promise<ApiResponse<{ user: User }>> {
    return apiClient.put('/auth/profile', data);
  },

  // Change password
  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<ApiResponse> {
    return apiClient.post('/auth/change-password', data);
  },

  // Logout
  async logout(): Promise<ApiResponse> {
    const response = await apiClient.post('/auth/logout');
    apiClient.clearAuth();
    return response;
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!apiClient.getAuthToken();
  },
};

export default authApi;
