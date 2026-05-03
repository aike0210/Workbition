import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import {
  Table,
  Tag,
  Space,
  Button,
  Avatar,
  Typography,
  Dropdown,
  message,
  Spin,
} from 'antd'
import {
  PlusOutlined,
  FilterOutlined,
  UserOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { taskApi } from '@/api'
import { Task } from '@/types'
import CreateTaskModal from '@/components/task/CreateTaskModal'
import TaskDetailDrawer from '@/components/task/TaskDetailDrawer'

const { Text } = Typography

const priorityConfig = {
  urgent: { color: 'red', label: '紧急' },
  high: { color: 'orange', label: '高' },
  medium: { color: 'blue', label: '中' },
  low: { color: 'green', label: '低' },
}

const statusConfig = {
  todo: { color: 'default', label: '待办' },
  in_progress: { color: 'processing', label: '进行中' },
  done: { color: 'success', label: '已完成' },
}

const ListViewPage = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState<string>('')

  useEffect(() => {
    if (projectId) {
      fetchTasks()
    }
  }, [projectId])

  const fetchTasks = async () => {
    if (!projectId) return
    setLoading(true)
    try {
      const response = await taskApi.getTasks(projectId)
      setTasks(response.items)
    } catch (error: any) {
      message.error(error.message || '获取任务列表失败')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTask = async (values: Partial<Task>) => {
    if (!projectId) return
    try {
      const newTask = await taskApi.createTask(projectId, values)
      setTasks((prev) => [...prev, newTask])
      message.success('任务创建成功')
      setCreateModalVisible(false)
    } catch (error: any) {
      message.error(error.message || '创建任务失败')
    }
  }

  const handleUpdateTask = async (taskId: string, data: Partial<Task>) => {
    try {
      const updatedTask = await taskApi.updateTask(taskId, data)
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)))
      message.success('任务更新成功')
    } catch (error: any) {
      message.error(error.message || '更新任务失败')
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      await taskApi.deleteTask(taskId)
      setTasks((prev) => prev.filter((t) => t.id !== taskId))
      message.success('任务已删除')
    } catch (error: any) {
      message.error(error.message || '删除任务失败')
    }
  }

  const columns: ColumnsType<Task> = [
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const config = statusConfig[status as keyof typeof statusConfig]
        return config ? <Tag color={config.color}>{config.label}</Tag> : null
      },
      filters: Object.entries(statusConfig).map(([key, config]) => ({
        text: config.label,
        value: key,
      })),
      onFilter: (value, record) => record.status === value,
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      render: (title, record) => (
        <Button
          type="link"
          style={{ padding: 0, height: 'auto' }}
          onClick={() => {
            setSelectedTaskId(record.id)
            setDetailDrawerVisible(true)
          }}
        >
          {title}
        </Button>
      ),
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (priority: string) => {
        const config = priorityConfig[priority as keyof typeof priorityConfig]
        return config ? <Tag color={config.color}>{config.label}</Tag> : null
      },
      filters: Object.entries(priorityConfig).map(([key, config]) => ({
        text: config.label,
        value: key,
      })),
      onFilter: (value, record) => record.priority === value,
    },
    {
      title: '负责人',
      dataIndex: 'assignee',
      key: 'assignee',
      width: 120,
      render: (assignee) =>
        assignee ? (
          <Space>
            <Avatar size="small" src={assignee.avatar} icon={<UserOutlined />} />
            <Text>{assignee.nickname || assignee.username}</Text>
          </Space>
        ) : (
          <Text type="secondary">未分配</Text>
        ),
    },
    {
      title: '截止日期',
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 120,
      render: (dueDate) =>
        dueDate ? (
          <Text>{new Date(dueDate).toLocaleDateString('zh-CN')}</Text>
        ) : (
          <Text type="secondary">-</Text>
        ),
      sorter: (a, b) => {
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      },
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      width: 150,
      render: (tags: string[]) =>
        tags?.length ? (
          <Space size={4}>
            {tags.slice(0, 2).map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
            {tags.length > 2 && <Tag>+{tags.length - 2}</Tag>}
          </Space>
        ) : (
          <Text type="secondary">-</Text>
        ),
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'edit',
                icon: <EditOutlined />,
                label: '编辑',
                onClick: () => {
                  setSelectedTaskId(record.id)
                  setDetailDrawerVisible(true)
                },
              },
              {
                type: 'divider',
              },
              {
                key: 'delete',
                icon: <DeleteOutlined />,
                label: '删除',
                danger: true,
                onClick: () => handleDeleteTask(record.id),
              },
            ],
          }}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ]

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <Space>
          <Button icon={<FilterOutlined />}>筛选</Button>
        </Space>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setCreateModalVisible(true)}
        >
          创建任务
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={tasks}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 20,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 个任务`,
        }}
      />

      <CreateTaskModal
        visible={createModalVisible}
        taskListId=""
        onSubmit={handleCreateTask}
        onCancel={() => setCreateModalVisible(false)}
      />

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

export default ListViewPage