import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, Tag, Avatar, Space, Typography, Checkbox, Tooltip } from 'antd'
import {
  ClockCircleOutlined,
  UserOutlined,
  PaperClipOutlined,
  MessageOutlined,
  CheckSquareOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons'
import { Task } from '@/types'

const { Text } = Typography

interface TaskCardProps {
  task: Task
  isDragging?: boolean
  onClick?: () => void
  onStatusChange?: (status: string) => void
}

const priorityConfig = {
  urgent: { color: 'red', label: '紧急', icon: <ExclamationCircleOutlined /> },
  high: { color: 'orange', label: '高' },
  medium: { color: 'blue', label: '中' },
  low: { color: 'green', label: '低' },
}

const TaskCard = ({ task, isDragging, onClick, onStatusChange }: TaskCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: task.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || isSortableDragging ? 0.5 : 1,
  }

  const priority = priorityConfig[task.priority] || priorityConfig.medium

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done'

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card
        hoverable
        size="small"
        onClick={onClick}
        style={{
          cursor: 'pointer',
          borderLeft: `3px solid ${task.status === 'done' ? '#52c41a' : priority.color === 'red' ? '#ff4d4f' : '#1677ff'}`,
        }}
        styles={{ body: { padding: '12px' } }}
      >
        {/* Priority Tag */}
        <div style={{ marginBottom: 8 }}>
          <Tag
            color={priority.color}
            icon={priority.icon}
            style={{ margin: 0, fontSize: 12 }}
          >
            {priority.label}
          </Tag>
          {isOverdue && (
            <Tag color="error" style={{ marginLeft: 4, fontSize: 12 }}>
              已逾期
            </Tag>
          )}
        </div>

        {/* Title */}
        <Text
          strong
          style={{
            display: 'block',
            marginBottom: 8,
            textDecoration: task.status === 'done' ? 'line-through' : 'none',
            color: task.status === 'done' ? '#999' : undefined,
          }}
        >
          {task.title}
        </Text>

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div style={{ marginBottom: 8 }}>
            {task.tags.slice(0, 3).map((tag) => (
              <Tag key={tag} style={{ fontSize: 11 }}>
                {tag}
              </Tag>
            ))}
            {task.tags.length > 3 && (
              <Tag style={{ fontSize: 11 }}>+{task.tags.length - 3}</Tag>
            )}
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 8,
          }}
        >
          <Space size={12}>
            {/* Due Date */}
            {task.dueDate && (
              <Tooltip title={`截止日期: ${task.dueDate}`}>
                <Space size={4}>
                  <ClockCircleOutlined style={{ color: isOverdue ? '#ff4d4f' : '#999', fontSize: 12 }} />
                  <Text
                    type="secondary"
                    style={{ fontSize: 12, color: isOverdue ? '#ff4d4f' : undefined }}
                  >
                    {new Date(task.dueDate).toLocaleDateString('zh-CN', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                </Space>
              </Tooltip>
            )}

            {/* Attachments */}
            <Tooltip title="附件">
              <Space size={4}>
                <PaperClipOutlined style={{ fontSize: 12, color: '#999' }} />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  2
                </Text>
              </Space>
            </Tooltip>

            {/* Comments */}
            <Tooltip title="评论">
              <Space size={4}>
                <MessageOutlined style={{ fontSize: 12, color: '#999' }} />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  3
                </Text>
              </Space>
            </Tooltip>

            {/* Subtasks */}
            <Tooltip title="子任务">
              <Space size={4}>
                <CheckSquareOutlined style={{ fontSize: 12, color: '#999' }} />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  2/5
                </Text>
              </Space>
            </Tooltip>
          </Space>

          {/* Assignee */}
          {task.assignee ? (
            <Tooltip title={task.assignee.nickname || task.assignee.username}>
              <Avatar
                size="small"
                src={task.assignee.avatar}
                icon={<UserOutlined />}
              />
            </Tooltip>
          ) : (
            <Tooltip title="未分配">
              <Avatar
                size="small"
                style={{ backgroundColor: '#f0f0f0' }}
                icon={<UserOutlined style={{ color: '#999' }} />}
              />
            </Tooltip>
          )}
        </div>
      </Card>
    </div>
  )
}

export default TaskCard