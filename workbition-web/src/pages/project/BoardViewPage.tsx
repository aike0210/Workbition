import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core'
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { Button, Spin, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import KanbanColumn from '@/components/kanban/KanbanColumn'
import TaskCard from '@/components/task/TaskCard'
import CreateTaskModal from '@/components/task/CreateTaskModal'
import TaskDetailDrawer from '@/components/task/TaskDetailDrawer'
import TaskFilterBar from '@/components/task/TaskFilterBar'
import { taskApi } from '@/api'
import { Task, TaskList } from '@/types'

const BoardViewPage = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const [taskLists, setTaskLists] = useState<TaskList[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [selectedTaskListId, setSelectedTaskListId] = useState<string>('')
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState<string>('')
  const [filters, setFilters] = useState({
    assigneeId: undefined as string | undefined,
    priority: undefined as string | undefined,
  })

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Fetch task lists and tasks
  useEffect(() => {
    if (projectId) {
      fetchData()
    }
  }, [projectId])

  const fetchData = async () => {
    if (!projectId) return
    setLoading(true)
    try {
      const [listsData, tasksData] = await Promise.all([
        taskApi.getTaskLists(projectId),
        taskApi.getTasks(projectId),
      ])
      setTaskLists(listsData ?? [])
      setTasks(tasksData?.records ?? [])
    } catch (error: any) {
      message.error(error.message || '获取数据失败')
    } finally {
      setLoading(false)
    }
  }

  // Get tasks for a specific list
  const getTasksForList = useCallback(
    (listId: string) => {
      return tasks
        .filter((task) => task.taskListId === listId)
        .filter((task) => {
          if (filters.assigneeId && task.assigneeId !== filters.assigneeId) return false
          if (filters.priority && task.priority !== filters.priority) return false
          return true
        })
        .sort((a, b) => a.position - b.position)
    },
    [tasks, filters]
  )

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const task = tasks.find((t) => t.id === active.id)
    if (task) {
      setActiveTask(task)
    }
  }

  // Handle drag over
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = Number(active.id)
    const overId = Number(over.id)

    const activeTask = tasks.find((t) => t.id === activeId)
    const overTask = tasks.find((t) => t.id === overId)

    if (!activeTask) return

    // If dropping over a task in a different list
    if (overTask && activeTask.taskListId !== overTask.taskListId) {
      setTasks((prev) => {
        const activeIndex = prev.findIndex((t) => t.id === activeId)
        const overIndex = prev.findIndex((t) => t.id === overId)

        const updatedTasks = [...prev]
        updatedTasks[activeIndex] = {
          ...updatedTasks[activeIndex],
          taskListId: overTask.taskListId,
        }

        return arrayMove(updatedTasks, activeIndex, overIndex)
      })
    }

    // If dropping over an empty list area
    if (!overTask && taskLists.some((list) => list.id === overId)) {
      setTasks((prev) => {
        const activeIndex = prev.findIndex((t) => t.id === activeId)
        const updatedTasks = [...prev]
        updatedTasks[activeIndex] = {
          ...updatedTasks[activeIndex],
          taskListId: overId,
        }
        return updatedTasks
      })
    }
  }

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const activeId = Number(active.id)
    const overId = Number(over.id)

    if (activeId === overId) return

    const activeTask = tasks.find((t) => t.id === activeId)
    const overTask = tasks.find((t) => t.id === overId)

    if (!activeTask) return

    // Determine new position
    const listTasks = getTasksForList(activeTask.taskListId)
    const overIndex = listTasks.findIndex((t) => t.id === overId)
    const newPosition = overIndex >= 0 ? overIndex : listTasks.length

    try {
      await taskApi.updateTaskPosition(activeId, {
        taskListId: activeTask.taskListId,
        position: newPosition,
      })
    } catch (error: any) {
      message.error(error.message || '更新任务位置失败')
      fetchData() // Revert on error
    }
  }

  // Handle create task
  const handleCreateTask = async (values: Partial<Task>) => {
    if (!projectId) return
    try {
      const newTask = await taskApi.createTask(projectId, {
        ...values,
        taskListId: selectedTaskListId,
      })
      setTasks((prev) => [...prev, newTask])
      message.success('任务创建成功')
      setCreateModalVisible(false)
    } catch (error: any) {
      message.error(error.message || '创建任务失败')
    }
  }

  // Handle update task
  const handleUpdateTask = async (taskId: string, data: Partial<Task>) => {
    try {
      const updatedTask = await taskApi.updateTask(taskId, data)
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)))
      message.success('任务更新成功')
    } catch (error: any) {
      message.error(error.message || '更新任务失败')
    }
  }

  // Handle delete task
  const handleDeleteTask = async (taskId: string) => {
    try {
      await taskApi.deleteTask(taskId)
      setTasks((prev) => prev.filter((t) => t.id !== taskId))
      message.success('任务已删除')
      setDetailDrawerVisible(false)
    } catch (error: any) {
      message.error(error.message || '删除任务失败')
    }
  }

  // Handle status change
  const handleStatusChange = async (taskId: string, status: string) => {
    try {
      const updatedTask = await taskApi.updateTaskStatus(taskId, status)
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)))
    } catch (error: any) {
      message.error(error.message || '更新状态失败')
    }
  }

  // Open create modal for specific list
  const openCreateModal = (listId: string) => {
    setSelectedTaskListId(listId)
    setCreateModalVisible(true)
  }

  // Open task detail drawer
  const openTaskDetail = (taskId: string) => {
    setSelectedTaskId(taskId)
    setDetailDrawerVisible(true)
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div>
      {/* Filter Bar */}
      <TaskFilterBar filters={filters} onFilterChange={setFilters} />

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div
          style={{
            display: 'flex',
            gap: 16,
            overflowX: 'auto',
            paddingBottom: 16,
            minHeight: 'calc(100vh - 300px)',
          }}
        >
          {taskLists.map((list) => (
            <KanbanColumn
              key={list.id}
              list={list}
              tasks={getTasksForList(list.id)}
              onAddTask={() => openCreateModal(list.id)}
              onTaskClick={openTaskDetail}
              onStatusChange={handleStatusChange}
            />
          ))}

          {/* Add List Button */}
          <div style={{ minWidth: 280 }}>
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              block
              style={{ height: 40 }}
            >
              添加列表
            </Button>
          </div>
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeTask ? (
            <TaskCard task={activeTask} isDragging />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Create Task Modal */}
      <CreateTaskModal
        visible={createModalVisible}
        taskListId={selectedTaskListId}
        onSubmit={handleCreateTask}
        onCancel={() => setCreateModalVisible(false)}
      />

      {/* Task Detail Drawer */}
      <TaskDetailDrawer
        visible={detailDrawerVisible}
        taskId={selectedTaskId}
        onClose={() => setDetailDrawerVisible(false)}
        onUpdate={handleUpdateTask}
        onDelete={handleDeleteTask}
      />
    </div>
  )
}

export default BoardViewPage