import { useState, useEffect } from 'react'
import {
  Drawer,
  Tabs,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Space,
  Tag,
  Typography,
  Avatar,
  List,
  Checkbox,
  Divider,
  message,
  Popconfirm,
  Spin,
} from 'antd'
import {
  UserOutlined,
  ClockCircleOutlined,
  TagOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  MessageOutlined,
  PaperClipOutlined,
  HistoryOutlined,
  CheckSquareOutlined,
} from '@ant-design/icons'
import { taskApi } from '@/api'
import { Task, Subtask, Comment, Activity } from '@/types'
import dayjs from 'dayjs'

const { Text, Title, Paragraph } = Typography
const { TextArea } = Input
const { Option } = Select

interface TaskDetailDrawerProps {
  visible: boolean
  taskId: string
  onClose: () => void
  onUpdate: (taskId: string, data: Partial<Task>) => Promise<void>
  onDelete: (taskId: string) => Promise<void>
}

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

const TaskDetailDrawer = ({ visible, taskId, onClose, onUpdate, onDelete }: TaskDetailDrawerProps) => {
  const [task, setTask] = useState<Task | null>(null)
  const [subtasks, setSubtasks] = useState<Subtask[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [newSubtask, setNewSubtask] = useState('')
  const [form] = Form.useForm()

  useEffect(() => {
    if (visible && taskId) {
      fetchTaskDetails()
    }
  }, [visible, taskId])

  const fetchTaskDetails = async () => {
    setLoading(true)
    try {
      const [taskData, subtasksData, commentsData, activitiesData] = await Promise.all([
        taskApi.getTask(taskId),
        taskApi.getSubtasks(taskId),
        taskApi.getComments(taskId),
        taskApi.getActivities(taskId),
      ])
      setTask(taskData)
      setSubtasks(subtasksData)
      setComments(commentsData)
      setActivities(activitiesData)
      form.setFieldsValue({
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        status: taskData.status,
        assigneeId: taskData.assigneeId,
        dueDate: taskData.dueDate ? dayjs(taskData.dueDate) : undefined,
      })
    } catch (error: any) {
      message.error(error.message || '获取任务详情失败')
    } finally {
      setLoading(false)
    }
  }

  // Update task
  const handleUpdate = async (values: any) => {
    try {
      await onUpdate(taskId, {
        ...values,
        dueDate: values.dueDate?.toISOString(),
      })
      setEditing(false)
      fetchTaskDetails()
    } catch (error) {
      // Error handled by parent
    }
  }

  // Toggle subtask
  const handleToggleSubtask = async (subtaskId: string, completed: boolean) => {
    try {
      await taskApi.updateSubtask(taskId, subtaskId, { completed })
      setSubtasks((prev) =>
        prev.map((s) => (s.id === subtaskId ? { ...s, completed } : s))
      )
    } catch (error: any) {
      message.error(error.message || '更新子任务失败')
    }
  }

  // Add subtask
  const handleAddSubtask = async () => {
    if (!newSubtask.trim()) return
    try {
      const subtask = await taskApi.createSubtask(taskId, { title: newSubtask })
      setSubtasks((prev) => [...prev, subtask])
      setNewSubtask('')
    } catch (error: any) {
      message.error(error.message || '添加子任务失败')
    }
  }

  // Delete subtask
  const handleDeleteSubtask = async (subtaskId: string) => {
    try {
      await taskApi.deleteSubtask(taskId, subtaskId)
      setSubtasks((prev) => prev.filter((s) => s.id !== subtaskId))
    } catch (error: any) {
      message.error(error.message || '删除子任务失败')
    }
  }

  // Add comment
  const handleAddComment = async () => {
    if (!commentText.trim()) return
    try {
      const comment = await taskApi.createComment(taskId, commentText)
      setComments((prev) => [...prev, comment])
      setCommentText('')
    } catch (error: any) {
      message.error(error.message || '添加评论失败')
    }
  }

  // Delete comment
  const handleDeleteComment = async (commentId: string) => {
    try {
      await taskApi.deleteComment(taskId, commentId)
      setComments((prev) => prev.filter((c) => c.id !== commentId))
    } catch (error: any) {
      message.error(error.message || '删除评论失败')
    }
  }

  const priority = task ? priorityConfig[task.priority] : null
  const status = task ? statusConfig[task.status] : null

  const tabItems = [
    {
      key: 'details',
      label: (
        <Space>
          <EditOutlined />
          <span>详情</span>
        </Space>
      ),
      children: loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Spin />
        </div>
      ) : (
        <div>
          {editing ? (
            <Form form={form} layout="vertical" onFinish={handleUpdate}>
              <Form.Item name="title" label="标题" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="description" label="描述">
                <TextArea rows={4} />
              </Form.Item>
              <div style={{ display: 'flex', gap: 16 }}>
                <Form.Item name="priority" label="优先级" style={{ flex: 1 }}>
                  <Select>
                    {Object.entries(priorityConfig).map(([key, config]) => (
                      <Option key={key} value={key}>
                        <Tag color={config.color}>{config.label}</Tag>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item name="status" label="状态" style={{ flex: 1 }}>
                  <Select>
                    {Object.entries(statusConfig).map(([key, config]) => (
                      <Option key={key} value={key}>
                        <Tag color={config.color}>{config.label}</Tag>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>
              <Form.Item name="assigneeId" label="负责人">
                <Select allowClear placeholder="选择负责人">
                  <Option value="user1">张三</Option>
                  <Option value="user2">李四</Option>
                </Select>
              </Form.Item>
              <Form.Item name="dueDate" label="截止日期">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">保存</Button>
                <Button onClick={() => setEditing(false)}>取消</Button>
              </Space>
            </Form>
          ) : (
            <div>
              <div style={{ marginBottom: 16 }}>
                <Text type="secondary">标题</Text>
                <Title level={4} style={{ marginTop: 4 }}>{task?.title}</Title>
              </div>

              {task?.description && (
                <div style={{ marginBottom: 16 }}>
                  <Text type="secondary">描述</Text>
                  <Paragraph style={{ marginTop: 4 }}>{task.description}</Paragraph>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <Text type="secondary">优先级</Text>
                  <div style={{ marginTop: 4 }}>
                    {priority && <Tag color={priority.color}>{priority.label}</Tag>}
                  </div>
                </div>
                <div>
                  <Text type="secondary">状态</Text>
                  <div style={{ marginTop: 4 }}>
                    {status && <Tag color={status.color}>{status.label}</Tag>}
                  </div>
                </div>
                <div>
                  <Text type="secondary">负责人</Text>
                  <div style={{ marginTop: 4 }}>
                    {task?.assigneeName ? (
                      <Space>
                        <Avatar size="small" src={task.assigneeAvatar} icon={<UserOutlined />} />
                        <Text>{task.assigneeName}</Text>
                      </Space>
                    ) : (
                      <Text type="secondary">未分配</Text>
                    )}
                  </div>
                </div>
                <div>
                  <Text type="secondary">截止日期</Text>
                  <div style={{ marginTop: 4 }}>
                    {task?.dueDate ? (
                      <Space>
                        <ClockCircleOutlined />
                        <Text>{dayjs(task.dueDate).format('YYYY-MM-DD')}</Text>
                      </Space>
                    ) : (
                      <Text type="secondary">未设置</Text>
                    )}
                  </div>
                </div>
              </div>

              {task?.tags && task.tags.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <Text type="secondary">标签</Text>
                  <div style={{ marginTop: 4 }}>
                    {task.tags.map((tag) => (
                      <Tag key={tag}>{tag}</Tag>
                    ))}
                  </div>
                </div>
              )}

              <Space>
                <Button icon={<EditOutlined />} onClick={() => setEditing(true)}>
                  编辑
                </Button>
                <Popconfirm
                  title="确定要删除这个任务吗？"
                  onConfirm={() => onDelete(taskId)}
                  okText="删除"
                  cancelText="取消"
                  okButtonProps={{ danger: true }}
                >
                  <Button danger icon={<DeleteOutlined />}>删除</Button>
                </Popconfirm>
              </Space>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'subtasks',
      label: (
        <Space>
          <CheckSquareOutlined />
          <span>子任务 ({subtasks.length})</span>
        </Space>
      ),
      children: (
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <Input
              value={newSubtask}
              onChange={(e) => setNewSubtask(e.target.value)}
              placeholder="添加子任务"
              onPressEnter={handleAddSubtask}
            />
            <Button icon={<PlusOutlined />} onClick={handleAddSubtask}>
              添加
            </Button>
          </div>
          <List
            dataSource={subtasks}
            renderItem={(subtask) => (
              <List.Item
                actions={[
                  <Popconfirm
                    title="确定删除？"
                    onConfirm={() => handleDeleteSubtask(subtask.id)}
                  >
                    <Button type="text" danger icon={<DeleteOutlined />} />
                  </Popconfirm>,
                ]}
              >
                <Checkbox
                  checked={subtask.completed}
                  onChange={(e) => handleToggleSubtask(subtask.id, e.target.checked)}
                >
                  <Text delete={subtask.completed}>{subtask.title}</Text>
                </Checkbox>
              </List.Item>
            )}
          />
        </div>
      ),
    },
    {
      key: 'comments',
      label: (
        <Space>
          <MessageOutlined />
          <span>评论 ({comments.length})</span>
        </Space>
      ),
      children: (
        <div>
          <div style={{ marginBottom: 16 }}>
            <TextArea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="添加评论..."
              rows={3}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddComment}
              style={{ marginTop: 8 }}
              disabled={!commentText.trim()}
            >
              发表评论
            </Button>
          </div>
          <List
            dataSource={comments}
            renderItem={(comment) => (
              <List.Item
                actions={[
                  <Popconfirm
                    title="确定删除？"
                    onConfirm={() => handleDeleteComment(comment.id)}
                  >
                    <Button type="text" danger icon={<DeleteOutlined />} />
                  </Popconfirm>,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar src={comment.user.avatarUrl} icon={<UserOutlined />} />
                  }
                  title={
                    <Space>
                      <Text strong>{comment.user.nickname || comment.user.username}</Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {dayjs(comment.createdAt).fromNow()}
                      </Text>
                    </Space>
                  }
                  description={comment.content}
                />
              </List.Item>
            )}
          />
        </div>
      ),
    },
    {
      key: 'activity',
      label: (
        <Space>
          <HistoryOutlined />
          <span>动态</span>
        </Space>
      ),
      children: (
        <List
          dataSource={activities}
          renderItem={(activity) => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  <Avatar src={activity.user.avatarUrl} icon={<UserOutlined />} size="small" />
                }
                title={
                  <Space>
                    <Text>{activity.user.nickname || activity.user.username}</Text>
                    <Text type="secondary">{activity.action}</Text>
                  </Space>
                }
                description={
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {dayjs(activity.createdAt).fromNow()}
                  </Text>
                }
              />
            </List.Item>
          )}
        />
      ),
    },
  ]

  return (
    <Drawer
      title={task?.title || '任务详情'}
      placement="right"
      width={480}
      onClose={onClose}
      open={visible}
      extra={
        <Space>
          <Button icon={<PaperClipOutlined />}>附件</Button>
        </Space>
      }
    >
      <Tabs items={tabItems} />
    </Drawer>
  )
}

export default TaskDetailDrawer