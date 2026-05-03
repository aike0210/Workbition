import { create } from 'zustand'
import { TaskList, Task } from '@/types'

interface BoardState {
  taskLists: TaskList[]
  tasks: Task[]
  activeTaskId: string | null
  isLoading: boolean
  error: string | null
}

interface BoardActions {
  setTaskLists: (taskLists: TaskList[]) => void
  addTaskList: (taskList: TaskList) => void
  updateTaskList: (taskList: TaskList) => void
  removeTaskList: (taskListId: string) => void
  setTasks: (tasks: Task[]) => void
  addTask: (task: Task) => void
  updateTask: (task: Task) => void
  removeTask: (taskId: string) => void
  moveTask: (taskId: string, newListId: string, newPosition: number) => void
  setActiveTaskId: (taskId: string | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  getTasksForList: (listId: string) => Task[]
  reorderTasks: (listId: string, taskIds: string[]) => void
}

export const useBoardStore = create<BoardState & BoardActions>()((set, get) => ({
  // State
  taskLists: [],
  tasks: [],
  activeTaskId: null,
  isLoading: false,
  error: null,

  // Actions
  setTaskLists: (taskLists) => set({ taskLists }),

  addTaskList: (taskList) =>
    set((state) => ({ taskLists: [...state.taskLists, taskList] })),

  updateTaskList: (taskList) =>
    set((state) => ({
      taskLists: state.taskLists.map((tl) =>
        tl.id === taskList.id ? taskList : tl
      ),
    })),

  removeTaskList: (taskListId) =>
    set((state) => ({
      taskLists: state.taskLists.filter((tl) => tl.id !== taskListId),
      tasks: state.tasks.filter((t) => t.taskListId !== taskListId),
    })),

  setTasks: (tasks) => set({ tasks }),

  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),

  updateTask: (task) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === task.id ? task : t)),
    })),

  removeTask: (taskId) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== taskId),
    })),

  moveTask: (taskId, newListId, newPosition) =>
    set((state) => {
      const taskIndex = state.tasks.findIndex((t) => t.id === taskId)
      if (taskIndex === -1) return state

      const updatedTasks = [...state.tasks]
      updatedTasks[taskIndex] = {
        ...updatedTasks[taskIndex],
        taskListId: newListId,
        position: newPosition,
      }

      return { tasks: updatedTasks }
    }),

  setActiveTaskId: (activeTaskId) => set({ activeTaskId }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  clearError: () => set({ error: null }),

  getTasksForList: (listId) => {
    const { tasks } = get()
    return tasks
      .filter((t) => t.taskListId === listId)
      .sort((a, b) => a.position - b.position)
  },

  reorderTasks: (listId, taskIds) =>
    set((state) => {
      const updatedTasks = state.tasks.map((task) => {
        if (task.taskListId !== listId) return task
        const newIndex = taskIds.indexOf(task.id)
        if (newIndex === -1) return task
        return { ...task, position: newIndex }
      })
      return { tasks: updatedTasks }
    }),
}))