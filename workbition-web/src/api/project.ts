import apiClient from './axios'
import { ApiResponse, PaginatedResponse, Project, ProjectMember, PaginationParams } from '@/types'

export const projectApi = {
  getProjects: async (params?: PaginationParams & { organizationId?: string }): Promise<PaginatedResponse<Project>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Project>>>('/projects', { params })
    return response.data.data
  },

  getProject: async (id: string): Promise<Project> => {
    const response = await apiClient.get<ApiResponse<Project>>(`/projects/${id}`)
    return response.data.data
  },

  createProject: async (data: Partial<Project>): Promise<Project> => {
    const response = await apiClient.post<ApiResponse<Project>>('/projects', data)
    return response.data.data
  },

  updateProject: async (id: string, data: Partial<Project>): Promise<Project> => {
    const response = await apiClient.put<ApiResponse<Project>>(`/projects/${id}`, data)
    return response.data.data
  },

  deleteProject: async (id: string): Promise<void> => {
    await apiClient.delete(`/projects/${id}`)
  },

  // Project members
  getProjectMembers: async (projectId: string): Promise<ProjectMember[]> => {
    const response = await apiClient.get<ApiResponse<ProjectMember[]>>(`/projects/${projectId}/members`)
    return response.data.data
  },

  addProjectMember: async (projectId: string, data: { userId: string; role: string }): Promise<ProjectMember> => {
    const response = await apiClient.post<ApiResponse<ProjectMember>>(`/projects/${projectId}/members`, data)
    return response.data.data
  },

  updateProjectMember: async (projectId: string, userId: string, data: { role: string }): Promise<ProjectMember> => {
    const response = await apiClient.put<ApiResponse<ProjectMember>>(`/projects/${projectId}/members/${userId}`, data)
    return response.data.data
  },

  removeProjectMember: async (projectId: string, userId: string): Promise<void> => {
    await apiClient.delete(`/projects/${projectId}/members/${userId}`)
  },
}