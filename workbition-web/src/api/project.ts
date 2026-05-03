import apiClient from './axios'
import { ApiResponse, Project, ProjectMember } from '@/types'

export const projectApi = {
  getProjects: async (params?: { orgId?: number; status?: string }): Promise<Project[]> => {
    const response = await apiClient.get<ApiResponse<Project[]>>('/projects', { params })
    return response.data.data ?? []
  },

  getProject: async (id: number | string): Promise<Project> => {
    const response = await apiClient.get<ApiResponse<Project>>(`/projects/${id}`)
    return response.data.data
  },

  createProject: async (data: { orgId: number; name: string; description?: string; visibility?: string }): Promise<Project> => {
    const response = await apiClient.post<ApiResponse<Project>>('/projects', data)
    return response.data.data
  },

  updateProject: async (id: number | string, data: Partial<Project>): Promise<Project> => {
    const response = await apiClient.put<ApiResponse<Project>>(`/projects/${id}`, data)
    return response.data.data
  },

  deleteProject: async (id: number | string): Promise<void> => {
    await apiClient.delete(`/projects/${id}`)
  },

  archiveProject: async (id: number | string): Promise<void> => {
    await apiClient.post(`/projects/${id}/archive`)
  },

  // Project members
  getProjectMembers: async (projectId: number | string): Promise<ProjectMember[]> => {
    const response = await apiClient.get<ApiResponse<ProjectMember[]>>(`/projects/${projectId}/members`)
    return response.data.data ?? []
  },

  addProjectMember: async (projectId: number | string, userId: number, role?: string): Promise<ProjectMember> => {
    const response = await apiClient.post<ApiResponse<ProjectMember>>(
      `/projects/${projectId}/members?userId=${userId}&role=${role || 'member'}`
    )
    return response.data.data
  },

  removeProjectMember: async (projectId: number | string, userId: number): Promise<void> => {
    await apiClient.delete(`/projects/${projectId}/members/${userId}`)
  },
}