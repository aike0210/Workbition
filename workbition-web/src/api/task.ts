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
  PaginationParams,
} from '@/types'

export const taskApi = {
  // Task Lists
  getTaskLists: async (projectId: string): Promise<TaskList[]> => {
    const response = await apiClient.get<ApiResponse<TaskList[]>>(`/projects/${projectId}/task-lists`)
    return response.data.data
  },

  createTaskList: async (projectId: string, data: Partial<TaskList>): Promise<TaskList> => {
    const response = await apiClient.post<ApiResponse<TaskList>>(`/projects/${projectId}/task-lists`, data)
    return response.data.data
  },

  updateTaskList: async (projectId: string, listId: string, data: Partial<TaskList>): Promise<TaskList> => {
    const response = await apiClient.put<ApiResponse<TaskList>>(`/projects/${projectId}/task-lists/${listId}`, data)
    return response.data.data
  },

  deleteTaskList: async (projectId: string, listId: string): Promise<void> => {
    await apiClient.delete(`/projects/${projectId}/task-lists/${listId}`)
  },

  // Tasks
  getTasks: async (
    projectId: string,
    params?: PaginationParams & {
      taskListId?: string
      status?: string
      assigneeId?: string
      priority?: string
    }
  ): Promise<PaginatedResponse<Task>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Task>>>(`/projects/${projectId}/tasks`, {
      params,
    })
    return response.data.data
  },

  getTask: async (taskId: string): Promise<Task> => {
    const response = await apiClient.get<ApiResponse<Task>>(`/tasks/${taskId}`)
    return response.data.data
  },

  createTask: async (projectId: string, data: Partial<Task>): Promise<Task> => {
    const response = await apiClient.post<ApiResponse<Task>>(`/projects/${projectId}/tasks`, data)
    return response.data.data
  },

  updateTask: async (taskId: string, data: Partial<Task>): Promise<Task> => {
    const response = await apiClient.put<ApiResponse<Task>>(`/tasks/${taskId}`, data)
    return response.data.data
  },

  deleteTask: async (taskId: string): Promise<void> => {
    await apiClient.delete(`/tasks/${taskId}`)
  },

  updateTaskStatus: async (taskId: string, status: string): Promise<Task> => {
    const response = await apiClient.patch<ApiResponse<Task>>(`/tasks/${taskId}/status`, { status })
    return response.data.data
  },

  updateTaskAssignee: async (taskId: string, assigneeId: string | null): Promise<Task> => {
    const response = await apiClient.patch<ApiResponse<Task>>(`/tasks/${taskId}/assignee`, { assigneeId })
    return response.data.data
  },

  updateTaskPosition: async (taskId: string, data: { taskListId: string; position: number }): Promise<Task> => {
    const response = await apiClient.patch<ApiResponse<Task>>(`/tasks/${taskId}/position`, data)
    return response.data.data
  },

  // Subtasks
  getSubtasks: async (taskId: string): Promise<Subtask[]> => {
    const response = await apiClient.get<ApiResponse<Subtask[]>>(`/tasks/${taskId}/subtasks`)
    return response.data.data
  },

  createSubtask: async (taskId: string, data: Partial<Subtask>): Promise<Subtask> => {
    const response = await apiClient.post<ApiResponse<Subtask>>(`/tasks/${taskId}/subtasks`, data)
    return response.data.data
  },

  updateSubtask: async (taskId: string, subtaskId: string, data: Partial<Subtask>): Promise<Subtask> => {
    const response = await apiClient.put<ApiResponse<Subtask>>(`/tasks/${taskId}/subtasks/${subtaskId}`, data)
    return response.data.data
  },

  deleteSubtask: async (taskId: string, subtaskId: string): Promise<void> => {
    await apiClient.delete(`/tasks/${taskId}/subtasks/${subtaskId}`)
  },

  // Comments
  getComments: async (taskId: string): Promise<Comment[]> => {
    const response = await apiClient.get<ApiResponse<Comment[]>>(`/tasks/${taskId}/comments`)
    return response.data.data
  },

  createComment: async (taskId: string, content: string): Promise<Comment> => {
    const response = await apiClient.post<ApiResponse<Comment>>(`/tasks/${taskId}/comments`, { content })
    return response.data.data
  },

  updateComment: async (taskId: string, commentId: string, content: string): Promise<Comment> => {
    const response = await apiClient.put<ApiResponse<Comment>>(`/tasks/${taskId}/comments/${commentId}`, { content })
    return response.data.data
  },

  deleteComment: async (taskId: string, commentId: string): Promise<void> => {
    await apiClient.delete(`/tasks/${taskId}/comments/${commentId}`)
  },

  // Attachments
  getAttachments: async (taskId: string): Promise<Attachment[]> => {
    const response = await apiClient.get<ApiResponse<Attachment[]>>(`/tasks/${taskId}/attachments`)
    return response.data.data
  },

  uploadAttachment: async (taskId: string, file: File): Promise<Attachment> => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await apiClient.post<ApiResponse<Attachment>>(`/tasks/${taskId}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data.data
  },

  deleteAttachment: async (taskId: string, attachmentId: string): Promise<void> => {
    await apiClient.delete(`/tasks/${taskId}/attachments/${attachmentId}`)
  },

  // Activities
  getActivities: async (taskId: string): Promise<Activity[]> => {
    const response = await apiClient.get<ApiResponse<Activity[]>>(`/tasks/${taskId}/activities`)
    return response.data.data
  },
}