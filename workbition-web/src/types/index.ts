// User types - matches backend UserResponse
export interface User {
  id: number
  username: string
  email: string
  phone?: string
  nickname?: string
  avatarUrl?: string
  status: number
  lastLoginAt?: string
  createdAt: string
}

export interface LoginRequest {
  emailOrUsername: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
}

export interface TokenResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
}

// Organization types
export interface Organization {
  id: number
  name: string
  logoUrl?: string
  description?: string
  ownerId: number
  status?: number
  memberCount?: number
  createdAt: string
}

export interface OrganizationMember {
  id: number
  userId: number
  orgId: number
  role: string
  username?: string
  nickname?: string
  avatarUrl?: string
  email?: string
  joinedAt: string
}

// Project types - matches backend ProjectResponse
export interface Project {
  id: number
  orgId: number
  name: string
  description?: string
  icon?: string
  color?: string
  visibility: string
  status?: string
  startDate?: string
  endDate?: string
  creatorId?: number
  creatorUsername?: string
  memberCount?: number
  currentUserRole?: string
  createdAt: string
}

export interface ProjectMember {
  id: number
  userId: number
  projectId: number
  role: string
  user?: User
  username?: string
  nickname?: string
  avatarUrl?: string
  joinedAt: string
}

export type ProjectRole = 'owner' | 'admin' | 'member' | 'viewer'

// Task types - matches backend TaskListResponse / TaskResponse
export interface TaskList {
  id: number
  projectId: number
  name: string
  position: number
  taskCount?: number
  createdAt: string
}

export interface Task {
  id: number
  projectId: number
  taskListId?: number
  parentTaskId?: number
  title: string
  description?: string
  status: string
  priority: string
  assigneeId?: number
  assigneeName?: string
  assigneeAvatar?: string
  creatorId?: number
  creatorName?: string
  startDate?: string
  dueDate?: string
  completedAt?: string
  position?: number
  isMilestone?: number
  tags?: string
  subtaskCount?: number
  completedSubtaskCount?: number
  commentCount?: number
  attachmentCount?: number
  createdAt: string
  updatedAt?: string
}

export interface Subtask {
  id: number
  parentTaskId: number
  title: string
  completed: boolean
  position: number
  createdAt: string
  updatedAt: string
}

export interface Comment {
  id: number
  taskId: number
  userId: number
  user: User
  content: string
  createdAt: string
  updatedAt?: string
}

export interface Attachment {
  id: number
  taskId: number
  fileName: string
  fileUrl: string
  fileSize: number
  fileType: string
  uploadedBy: User
  uploadedAt: string
}

export interface Activity {
  id: number
  projectId: number
  taskId?: number
  userId: number
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

// Matches MyBatis-Plus Page response
export interface PaginatedResponse<T> {
  records: T[]
  total: number
  size: number
  current: number
  pages: number
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