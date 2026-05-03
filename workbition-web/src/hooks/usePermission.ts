import { useMemo } from 'react'
import { useAuthStore } from '@/stores/authStore'

type Permission =
  | 'project:create'
  | 'project:edit'
  | 'project:delete'
  | 'project:manage_members'
  | 'task:create'
  | 'task:edit'
  | 'task:delete'
  | 'task:assign'
  | 'comment:create'
  | 'comment:edit'
  | 'comment:delete'
  | 'organization:manage'

interface PermissionContext {
  organizationRole?: string
  projectRole?: string
}

export const usePermission = (context?: PermissionContext) => {
  const { user } = useAuthStore()

  const permissions = useMemo(() => {
    const hasPermission = (permission: Permission): boolean => {
      if (!user) return false

      // Organization owner has all permissions
      if (context?.organizationRole === 'owner') return true

      // Organization admin has most permissions
      if (context?.organizationRole === 'admin') {
        const adminRestricted: Permission[] = ['organization:manage']
        return !adminRestricted.includes(permission)
      }

      // Project-level permissions
      switch (context?.projectRole) {
        case 'owner':
          return true
        case 'admin':
          return permission !== 'project:delete'
        case 'member':
          return [
            'task:create',
            'task:edit',
            'task:assign',
            'comment:create',
            'comment:edit',
            'comment:delete',
          ].includes(permission)
        case 'viewer':
          return false
        default:
          // Default member permissions
          return [
            'project:create',
            'task:create',
            'task:edit',
            'comment:create',
          ].includes(permission)
      }
    }

    return {
      canCreateProject: hasPermission('project:create'),
      canEditProject: hasPermission('project:edit'),
      canDeleteProject: hasPermission('project:delete'),
      canManageMembers: hasPermission('project:manage_members'),
      canCreateTask: hasPermission('task:create'),
      canEditTask: hasPermission('task:edit'),
      canDeleteTask: hasPermission('task:delete'),
      canAssignTask: hasPermission('task:assign'),
      canCreateComment: hasPermission('comment:create'),
      canEditComment: hasPermission('comment:edit'),
      canDeleteComment: hasPermission('comment:delete'),
      canManageOrganization: hasPermission('organization:manage'),
    }
  }, [user, context])

  return permissions
}

export default usePermission