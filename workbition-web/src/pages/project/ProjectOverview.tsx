import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Space,
  List,
  Avatar,
  Tag,
  Progress,
  message,
} from 'antd'
import {
  ProjectOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { projectApi, taskApi } from '@/api'
import { Project, Task } from '@/types'

const { Title, Text, Paragraph } = Typography

const ProjectOverview = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const [project, setProject] = useState<Project | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (projectId) {
      fetchData()
    }
  }, [projectId])

  const fetchData = async () => {
    if (!projectId) return
    setLoading(true)
    try {
      const [projectData, tasksData] = await Promise.all([
        projectApi.getProject(projectId),
        taskApi.getTasks(projectId),
      ])
      setProject(projectData)
      setTasks(tasksData.items)
    } catch (error: any) {
      message.error(error.message || '获取数据失败')
    } finally {
      setLoading(false)
    }
  }

  // Calculate statistics
  const totalTasks = tasks.length
  const completedTasks = tasks.filter((t) => t.status === 'done').length
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length
  const todoTasks = tasks.filter((t) => t.status === 'todo').length
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  // Get recent tasks
  const recentTasks = [...tasks]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5)

  // Get overdue tasks
  const overdueTasks = tasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done'
  )

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

  if (loading) {
    return <Card loading />
  }

  if (!project) {
    return null
  }

  return (
    <div>
      {/* Project Info */}
      <Card style={{ marginBottom: 16 }}>
        <Space align="start">
          <Avatar
            size={64}
            style={{ backgroundColor: '#1677ff' }}
            icon={<ProjectOutlined />}
          />
          <div>
            <Title level={3} style={{ marginBottom: 0 }}>
              {project.name}
            </Title>
            <Paragraph type="secondary" style={{ marginBottom: 0 }}>
              {project.description || '暂无项目描述'}
            </Paragraph>
          </div>
        </Space>
      </Card>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总任务数"
              value={totalTasks}
              prefix={<ProjectOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已完成"
              value={completedTasks}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="进行中"
              value={inProgressTasks}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="待办"
              value={todoTasks}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        {/* Completion Rate */}
        <Col span={8}>
          <Card title="完成进度">
            <div style={{ textAlign: 'center' }}>
              <Progress
                type="circle"
                percent={completionRate}
                size={120}
                format={(percent) => `${percent}%`}
              />
              <div style={{ marginTop: 16 }}>
                <Text type="secondary">
                  {completedTasks} / {totalTasks} 个任务已完成
                </Text>
              </div>
            </div>
          </Card>
        </Col>

        {/* Recent Tasks */}
        <Col span={8}>
          <Card title="最近更新">
            <List
              dataSource={recentTasks}
              renderItem={(task) => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <Space>
                        <Text>{task.title}</Text>
                        <Tag
                          color={statusConfig[task.status as keyof typeof statusConfig]?.color}
                        >
                          {statusConfig[task.status as keyof typeof statusConfig]?.label}
                        </Tag>
                      </Space>
                    }
                    description={
                      <Space>
                        <Tag
                          color={priorityConfig[task.priority as keyof typeof priorityConfig]?.color}
                        >
                          {priorityConfig[task.priority as keyof typeof priorityConfig]?.label}
                        </Tag>
                        {task.assignee && (
                          <Space size={4}>
                            <Avatar size="small" src={task.assignee.avatar} icon={<UserOutlined />} />
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {task.assignee.nickname || task.assignee.username}
                            </Text>
                          </Space>
                        )}
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Overdue Tasks */}
        <Col span={8}>
          <Card
            title="逾期任务"
            extra={<Tag color="red">{overdueTasks.length}</Tag>}
          >
            {overdueTasks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 24 }}>
                <CheckCircleOutlined style={{ fontSize: 32, color: '#52c41a' }} />
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary">没有逾期任务</Text>
                </div>
              </div>
            ) : (
              <List
                dataSource={overdueTasks.slice(0, 5)}
                renderItem={(task) => (
                  <List.Item>
                    <List.Item.Meta
                      title={
                        <Space>
                          <Text>{task.title}</Text>
                          <Tag color="red">逾期</Tag>
                        </Space>
                      }
                      description={
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          截止日期: {new Date(task.dueDate!).toLocaleDateString('zh-CN')}
                        </Text>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default ProjectOverview