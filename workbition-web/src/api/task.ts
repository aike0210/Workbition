import apiClient from './axios'
import {
  ApiResponse,
  PaginatedResponse,
  Task,
  TaskList,
  Subtask,
  Comment,
  Attachment,
  Activity,
} from '@/types'

export const taskApi = {
  // Task Lists
  getTaskLists: async (projectId: number | string): Promise<TaskList[]> => {
    const response = await apiClient.get<ApiResponse<TaskList[]>>(`/projects/${projectId}/tasklists`)
    return response.data.data ?? []
  },

  createTaskList: async (projectId: number | string, data: { name: string; position?: number }): Promise<TaskList> => {
    const response = await apiClient.post<ApiResponse<TaskList>>(`/projects/${projectId}/tasklists`, data)
    return response.data.data
  },

  updateTaskList: async (listId: number | string, data: { name?: string; position?: number }): Promise<TaskList> => {
    const response = await apiClient.put<ApiResponse<TaskList>>(`/tasklists/${listId}`, data)
    return response.data.data
  },

  deleteTaskList: async (listId: number | string): Promise<void> => {
    await apiClient.delete(`/tasklists/${listId}`)
  },

  // Tasks
  getTasks: async (
    projectId: number | string,
    params?: {
      page?: number
      size?: number
      status?: string
      assigneeId?: number
      priority?: string
    }
  ): Promise<PaginatedResponse<Task>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Task>>>(`/projects/${projectId}/tasks`, {
      params,
    })
    return response.data.data ?? { records: [], total: 0, size: 20, current: 1, pages: 0 }
  },

  getTask: async (taskId: number | string): Promise<Task> => {
    const response = await apiClient.get<ApiResponse<Task>>(`/tasks/${taskId}`)
    return response.data.data
  },

  createTask: async (projectId: number | string, data: {
    title: string
    description?: string
    taskListId?: number
    status?: string
    priority?: string
    assigneeId?: number
    dueDate?: string
  }): Promise<Task> => {
    const response = await apiClient.post<ApiResponse<Task>>(`/projects/${projectId}/tasks`, data)
    return response.data.data
  },

  updateTask: async (taskId: number | string, data: {
    title?: string
    description?: string
    taskListId?: number
    status?: string
    priority?: string
    assigneeId?: number | null
    dueDate?: string
    position?: number
  }): Promise<Task> => {
    const response = await apiClient.put<ApiResponse<Task>>(`/tasks/${taskId}`, data)
    return response.data.data
  },

  deleteTask: async (taskId: number | string): Promise<void> => {
    await apiClient.delete(`/tasks/${taskId}`)
  },

  updateTaskStatus: async (taskId: number | string, status: string): Promise<Task> => {
    const response = await apiClient.patch<ApiResponse<Task>>(`/tasks/${taskId}/status`, { status })
    return response.data.data
  },

  updateTaskAssignee: async (taskId: number | string, assigneeId: number | null): Promise<Task> => {
    const response = await apiClient.patch<ApiResponse<Task>>(`/tasks/${taskId}/assignee`, { assigneeId })
    return response.data.data
  },

  updateTaskPosition: async (taskId: number | string, data: { taskListId: number; position: number }): Promise<Task> => {
    const response = await apiClient.patch<ApiResponse<Task>>(`/tasks/${taskId}/position`, data)
    return response.data.data
  },

  // Subtasks
  getSubtasks: async (taskId: number | string): Promise<Subtask[]> => {
    const response = await apiClient.get<ApiResponse<Subtask[]>>(`/tasks/${taskId}/subtasks`)
    return response.data.data ?? []
  },

  createSubtask: async (taskId: number | string, data: { title: string }): Promise<Subtask> => {
    const response = await apiClient.post<ApiResponse<Subtask>>(`/tasks/${taskId}/subtasks`, data)
    return response.data.data
  },

  updateSubtask: async (taskId: number | string, subtaskId: number | string, data: Partial<Subtask>): Promise<Subtask> => {
    const response = await apiClient.put<ApiResponse<Subtask>>(`/tasks/${taskId}/subtasks/${subtaskId}`, data)
    return response.data.data
  },

  deleteSubtask: async (taskId: number | string, subtaskId: number | string): Promise<void> => {
    await apiClient.delete(`/tasks/${taskId}/subtasks/${subtaskId}`)
  },

  // Comments
  getComments: async (taskId: number | string): Promise<Comment[]> => {
    const response = await apiClient.get<ApiResponse<Comment[]>>(`/tasks/${taskId}/comments`)
    return response.data.data ?? []
  },

  createComment: async (taskId: number | string, content: string): Promise<Comment> => {
    const response = await apiClient.post<ApiResponse<Comment>>(`/tasks/${taskId}/comments`, { content })
    return response.data.data
  },

  updateComment: async (taskId: number | string, commentId: number | string, content: string): Promise<Comment> => {
    const response = await apiClient.put<ApiResponse<Comment>>(`/tasks/${taskId}/comments/${commentId}`, { content })
    return response.data.data
  },

  deleteComment: async (taskId: number | string, commentId: number | string): Promise<void> => {
    await apiClient.delete(`/tasks/${taskId}/comments/${commentId}`)
  },

  // Attachments
  getAttachments: async (taskId: number | string): Promise<Attachment[]> => {
    const response = await apiClient.get<ApiResponse<Attachment[]>>(`/tasks/${taskId}/attachments`)
    return response.data.data ?? []
  },

  uploadAttachment: async (taskId: number | string, file: File): Promise<Attachment> => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await apiClient.post<ApiResponse<Attachment>>(`/tasks/${taskId}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data.data
  },

  deleteAttachment: async (taskId: number | string, attachmentId: number | string): Promise<void> => {
    await apiClient.delete(`/tasks/${taskId}/attachments/${attachmentId}`)
  },

  // Activities
  getActivities: async (taskId: number | string): Promise<Activity[]> => {
    const response = await apiClient.get<ApiResponse<Activity[]>>(`/tasks/${taskId}/activities`)
    return response.data.data ?? []
  },
}