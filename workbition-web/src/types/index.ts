// User types
export interface User {
  id: string
  username: string
  email: string
  avatar?: string
  nickname?: string
  phone?: string
  createdAt: string
  updatedAt: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  confirmPassword: string
}

export interface AuthResponse {
  user: User
  token: string
  refreshToken: string
}

// Organization types
export interface Organization {
  id: string
  name: string
  logo?: string
  description?: string
  ownerId: string
  createdAt: string
  updatedAt: string
}

export interface OrganizationMember {
  id: string
  userId: string
  organizationId: string
  role: OrganizationRole
  user: User
  joinedAt: string
}

export type OrganizationRole = 'owner' | 'admin' | 'member'

// Project types
export interface Project {
  id: string
  name: string
  description?: string
  organizationId: string
  visibility: 'public' | 'private'
  template?: string
  createdAt: string
  updatedAt: string
}

export interface ProjectMember {
  id: string
  userId: string
  projectId: string
  role: ProjectRole
  user: User
  joinedAt: string
}

export type ProjectRole = 'owner' | 'admin' | 'member' | 'viewer'

// Task types
export interface TaskList {
  id: string
  projectId: string
  name: string
  position: number
  createdAt: string
  updatedAt: string
}

export interface Task {
  id: string
  taskListId: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  assigneeId?: string
  assignee?: User
  dueDate?: string
  tags: string[]
  position: number
  createdAt: string
  updatedAt: string
}

export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'custom'
export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low'

export interface Subtask {
  id: string
  parentTaskId: string
  title: string
  completed: boolean
  position: number
  createdAt: string
  updatedAt: string
}

export interface Comment {
  id: string
  taskId: string
  userId: string
  user: User
  content: string
  createdAt: string
  updatedAt: string
}

export interface Attachment {
  id: string
  taskId: string
  fileName: string
  fileUrl: string
  fileSize: number
  fileType: string
  uploadedBy: User
  uploadedAt: string
}

export interface Activity {
  id: string
  projectId: string
  taskId?: string
  userId: string
  user: User
  action: string
  details?: Record<string, any>
  createdAt: string
}

// Workflow types
export interface Workflow {
  id: string
  projectId: string
  name: string
  states: WorkflowState[]
  transitions: WorkflowTransition[]
  createdAt: string
  updatedAt: string
}

export interface WorkflowState {
  id: string
  name: string
  color: string
  position: number
  isDefault: boolean
  isFinal: boolean
}

export interface WorkflowTransition {
  id: string
  fromStateId: string
  toStateId: string
  name: string
  conditions?: WorkflowCondition[]
  actions?: WorkflowAction[]
}

export interface WorkflowCondition {
  field: string
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than'
  value: any
}

export interface WorkflowAction {
  type: 'assign' | 'notify' | 'update_field'
  config: Record<string, any>
}

// Notification types
export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  content: string
  read: boolean
  link?: string
  createdAt: string
}

export type NotificationType =
  | 'task_assigned'
  | 'task_commented'
  | 'task_mentioned'
  | 'project_invited'
  | 'organization_invited'
  | 'system'

// API types
export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface PaginationParams {
  page?: number
  pageSize?: number
}

// Common types
export interface SelectOption {
  label: string
  value: string | number
  disabled?: boolean
}

export interface FileUpload {
  file: File
  progress: number
  status: 'uploading' | 'success' | 'error'
  url?: string
}