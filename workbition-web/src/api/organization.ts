import apiClient from './axios'
import { ApiResponse, Organization, OrganizationMember, PaginatedResponse, PaginationParams } from '@/types'

export const organizationApi = {
  getOrganizations: async (params?: PaginationParams): Promise<PaginatedResponse<Organization>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Organization>>>('/organizations', { params })
    return response.data.data
  },

  getOrganization: async (id: string): Promise<Organization> => {
    const response = await apiClient.get<ApiResponse<Organization>>(`/organizations/${id}`)
    return response.data.data
  },

  createOrganization: async (data: Partial<Organization>): Promise<Organization> => {
    const response = await apiClient.post<ApiResponse<Organization>>('/organizations', data)
    return response.data.data
  },

  updateOrganization: async (id: string, data: Partial<Organization>): Promise<Organization> => {
    const response = await apiClient.put<ApiResponse<Organization>>(`/organizations/${id}`, data)
    return response.data.data
  },

  deleteOrganization: async (id: string): Promise<void> => {
    await apiClient.delete(`/organizations/${id}`)
  },

  // Organization members
  getOrganizationMembers: async (orgId: string): Promise<OrganizationMember[]> => {
    const response = await apiClient.get<ApiResponse<OrganizationMember[]>>(`/organizations/${orgId}/members`)
    return response.data.data
  },

  inviteMember: async (orgId: string, data: { email: string; role: string }): Promise<OrganizationMember> => {
    const response = await apiClient.post<ApiResponse<OrganizationMember>>(
      `/organizations/${orgId}/members/invite`,
      data
    )
    return response.data.data
  },

  updateMemberRole: async (orgId: string, userId: string, role: string): Promise<OrganizationMember> => {
    const response = await apiClient.put<ApiResponse<OrganizationMember>>(
      `/organizations/${orgId}/members/${userId}`,
      { role }
    )
    return response.data.data
  },

  removeMember: async (orgId: string, userId: string): Promise<void> => {
    await apiClient.delete(`/organizations/${orgId}/members/${userId}`)
  },
}