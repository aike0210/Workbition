import { create } from 'zustand'
import { Project, TaskList, Task } from '@/types'

interface ProjectState {
  currentProject: Project | null
  projects: Project[]
  taskLists: TaskList[]
  tasks: Task[]
  isLoading: boolean
  error: string | null
}

interface ProjectActions {
  setCurrentProject: (project: Project | null) => void
  setProjects: (projects: Project[]) => void
  addProject: (project: Project) => void
  updateProject: (project: Project) => void
  removeProject: (projectId: string) => void
  setTaskLists: (taskLists: TaskList[]) => void
  addTaskList: (taskList: TaskList) => void
  updateTaskList: (taskList: TaskList) => void
  removeTaskList: (taskListId: string) => void
  setTasks: (tasks: Task[]) => void
  addTask: (task: Task) => void
  updateTask: (task: Task) => void
  removeTask: (taskId: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
}

export const useProjectStore = create<ProjectState & ProjectActions>()((set) => ({
  // State
  currentProject: null,
  projects: [],
  taskLists: [],
  tasks: [],
  isLoading: false,
  error: null,

  // Actions
  setCurrentProject: (currentProject) => set({ currentProject }),
  setProjects: (projects) => set({ projects }),
  addProject: (project) =>
    set((state) => ({ projects: [...state.projects, project] })),
  updateProject: (project) =>
    set((state) => ({
      projects: state.projects.map((p) => (p.id === project.id ? project : p)),
      currentProject: state.currentProject?.id === project.id ? project : state.currentProject,
    })),
  removeProject: (projectId) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== projectId),
      currentProject: state.currentProject?.id === projectId ? null : state.currentProject,
    })),
  setTaskLists: (taskLists) => set({ taskLists }),
  addTaskList: (taskList) =>
    set((state) => ({ taskLists: [...state.taskLists, taskList] })),
  updateTaskList: (taskList) =>
    set((state) => ({
      taskLists: state.taskLists.map((tl) => (tl.id === taskList.id ? taskList : tl)),
    })),
  removeTaskList: (taskListId) =>
    set((state) => ({
      taskLists: state.taskLists.filter((tl) => tl.id !== taskListId),
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
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}))