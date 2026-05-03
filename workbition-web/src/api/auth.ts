import apiClient from './axios'
import { ApiResponse, AuthResponse, LoginRequest, RegisterRequest, User } from '@/types'

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data)
    return response.data.data
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data)
    return response.data.data
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout')
  },

  refreshToken: async (refreshToken: string): Promise<{ token: string }> => {
    const response = await apiClient.post<ApiResponse<{ token: string }>>('/auth/refresh', {
      refreshToken,
    })
    return response.data.data
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>('/users/me')
    return response.data.data
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await apiClient.put<ApiResponse<User>>('/users/me', data)
    return response.data.data
  },

  changePassword: async (oldPassword: string, newPassword: string): Promise<void> => {
    await apiClient.put('/users/me/password', { oldPassword, newPassword })
  },
}