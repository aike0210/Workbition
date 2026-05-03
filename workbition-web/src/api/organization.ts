import apiClient from './axios'
import { ApiResponse, Organization, OrganizationMember } from '@/types'

export const organizationApi = {
  getOrganizations: async (): Promise<Organization[]> => {
    const response = await apiClient.get<ApiResponse<Organization[]>>('/organizations')
    return response.data.data ?? []
  },

  getOrganization: async (id: number): Promise<Organization> => {
    const response = await apiClient.get<ApiResponse<Organization>>(`/organizations/${id}`)
    return response.data.data
  },

  createOrganization: async (data: { name: string; description?: string; logoUrl?: string }): Promise<Organization> => {
    const response = await apiClient.post<ApiResponse<Organization>>('/organizations', data)
    return response.data.data
  },

  updateOrganization: async (id: number, data: { name?: string; description?: string; logoUrl?: string }): Promise<Organization> => {
    const response = await apiClient.put<ApiResponse<Organization>>(`/organizations/${id}`, data)
    return response.data.data
  },

  deleteOrganization: async (id: number): Promise<void> => {
    await apiClient.delete(`/organizations/${id}`)
  },

  // Organization members
  getOrganizationMembers: async (orgId: number): Promise<OrganizationMember[]> => {
    const response = await apiClient.get<ApiResponse<OrganizationMember[]>>(`/organizations/${orgId}/members`)
    return response.data.data ?? []
  },

  addMember: async (orgId: number, data: { email: string; role?: string }): Promise<OrganizationMember> => {
    const response = await apiClient.post<ApiResponse<OrganizationMember>>(
      `/organizations/${orgId}/members`,
      data
    )
    return response.data.data
  },

  updateMemberRole: async (orgId: number, userId: number, data: { role: string }): Promise<OrganizationMember> => {
    const response = await apiClient.put<ApiResponse<OrganizationMember>>(
      `/organizations/${orgId}/members/${userId}`,
      data
    )
    return response.data.data
  },

  removeMember: async (orgId: number, userId: number): Promise<void> => {
    await apiClient.delete(`/organizations/${orgId}/members/${userId}`)
  },
}