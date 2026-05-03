import { create } from 'zustand'
import { Notification } from '@/types'

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
}

interface NotificationActions {
  setNotifications: (notifications: Notification[]) => void
  addNotification: (notification: Notification) => void
  markAsRead: (notificationId: string) => void
  markAllAsRead: () => void
  removeNotification: (notificationId: string) => void
  clearNotifications: () => void
  setLoading: (loading: boolean) => void
  updateUnreadCount: () => void
}

export const useNotificationStore = create<NotificationState & NotificationActions>()((set, get) => ({
  // State
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  // Actions
  setNotifications: (notifications) => {
    set({ notifications })
    get().updateUnreadCount()
  },

  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
    }))
    get().updateUnreadCount()
  },

  markAsRead: (notificationId) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      ),
    }))
    get().updateUnreadCount()
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    }))
    get().updateUnreadCount()
  },

  removeNotification: (notificationId) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== notificationId),
    }))
    get().updateUnreadCount()
  },

  clearNotifications: () => {
    set({ notifications: [], unreadCount: 0 })
  },

  setLoading: (isLoading) => set({ isLoading }),

  updateUnreadCount: () => {
    const { notifications } = get()
    const unreadCount = notifications.filter((n) => !n.read).length
    set({ unreadCount })
  },
}))