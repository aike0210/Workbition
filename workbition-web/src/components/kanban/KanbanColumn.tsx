import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Card, Typography, Badge, Button, Space, Dropdown } from 'antd'
import { PlusOutlined, MoreOutlined } from '@ant-design/icons'
import TaskCard from '@/components/task/TaskCard'
import { Task, TaskList } from '@/types'

const { Text } = Typography

interface KanbanColumnProps {
  list: TaskList
  tasks: Task[]
  onAddTask: () => void
  onTaskClick: (taskId: string) => void
  onStatusChange: (taskId: string, status: string) => void
}

const KanbanColumn = ({ list, tasks, onAddTask, onTaskClick, onStatusChange }: KanbanColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: list.id,
  })

  const menuItems = [
    {
      key: 'rename',
      label: '重命名',
    },
    {
      key: 'clear',
      label: '清空列表',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'delete',
      label: '删除列表',
      danger: true,
    },
  ]

  return (
    <div
      ref={setNodeRef}
      style={{
        minWidth: 280,
        maxWidth: 280,
        backgroundColor: isOver ? '#f0f5ff' : '#f5f5f5',
        borderRadius: 8,
        padding: 12,
        transition: 'background-color 0.2s',
      }}
    >
      {/* Column Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
          padding: '0 4px',
        }}
      >
        <Space>
          <Text strong>{list.name}</Text>
          <Badge
            count={tasks.length}
            style={{
              backgroundColor: '#f0f0f0',
              color: '#666',
              fontWeight: 'normal',
            }}
          />
        </Space>

        <Space>
          <Button
            type="text"
            size="small"
            icon={<PlusOutlined />}
            onClick={onAddTask}
          />
          <Dropdown menu={{ items: menuItems }} trigger={['click']}>
            <Button type="text" size="small" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      </div>

      {/* Tasks */}
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick(task.id)}
              onStatusChange={(status) => onStatusChange(task.id, status)}
            />
          ))}
        </div>
      </SortableContext>

      {/* Add Task Button */}
      <Button
        type="text"
        block
        icon={<PlusOutlined />}
        onClick={onAddTask}
        style={{ marginTop: 8, color: '#999' }}
      >
        添加任务
      </Button>
    </div>
  )
}

export default KanbanColumn