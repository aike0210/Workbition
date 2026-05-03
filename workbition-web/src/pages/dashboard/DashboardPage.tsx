import { useEffect, useState } from 'react'
import { Card, Row, Col, Statistic, Typography, List, Avatar, Tag, Space, Button } from 'antd'
import {
  ProjectOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  PlusOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

const { Title, Text } = Typography

interface RecentProject {
  id: string
  name: string
  description: string
  memberCount: number
  taskCount: number
  updatedAt: string
}

interface RecentTask {
  id: string
  title: string
  project: string
  status: 'todo' | 'in_progress' | 'done'
  priority: 'urgent' | 'high' | 'medium' | 'low'
  dueDate?: string
}

const DashboardPage = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([])
  const [recentTasks, setRecentTasks] = useState<RecentTask[]>([])

  // Mock data - replace with API calls
  useEffect(() => {
    setRecentProjects([
      {
        id: '1',
        name: 'Workbition 开发',
        description: '团队协作与项目管理平台开发',
        memberCount: 5,
        taskCount: 24,
        updatedAt: '2026-05-03T10:00:00Z',
      },
      {
        id: '2',
        name: '移动端 App',
        description: 'iOS 和 Android 应用开发',
        memberCount: 3,
        taskCount: 18,
        updatedAt: '2026-05-02T15:30:00Z',
      },
      {
        id: '3',
        name: '市场推广',
        description: '产品上线推广计划',
        memberCount: 4,
        taskCount: 12,
        updatedAt: '2026-05-01T09:00:00Z',
      },
    ])

    setRecentTasks([
      {
        id: '1',
        title: '完成用户认证模块',
        project: 'Workbition 开发',
        status: 'in_progress',
        priority: 'high',
        dueDate: '2026-05-05',
      },
      {
        id: '2',
        title: '设计首页 UI',
        project: '移动端 App',
        status: 'todo',
        priority: 'medium',
        dueDate: '2026-05-08',
      },
      {
        id: '3',
        title: '编写 API 文档',
        project: 'Workbition 开发',
        status: 'done',
        priority: 'low',
      },
      {
        id: '4',
        title: '准备推广素材',
        project: '市场推广',
        status: 'todo',
        priority: 'urgent',
        dueDate: '2026-05-04',
      },
    ])
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo':
        return 'default'
      case 'in_progress':
        return 'processing'
      case 'done':
        return 'success'
      default:
        return 'default'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'todo':
        return '待办'
      case 'in_progress':
        return '进行中'
      case 'done':
        return '已完成'
      default:
        return status
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'red'
      case 'high':
        return 'orange'
      case 'medium':
        return 'blue'
      case 'low':
        return 'green'
      default:
        return 'default'
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={4}>
          欢迎回来，{user?.nickname || user?.username}
        </Title>
        <Text type="secondary">这是你的工作台概览</Text>
      </div>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="进行中的项目"
              value={3}
              prefix={<ProjectOutlined />}
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="待办任务"
              value={12}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已完成任务"
              value={45}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="团队成员"
              value={8}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        {/* Recent Projects */}
        <Col span={12}>
          <Card
            title="最近的项目"
            extra={
              <Button
                type="link"
                icon={<PlusOutlined />}
                onClick={() => navigate('/projects')}
              >
                查看全部
              </Button>
            }
          >
            <List
              dataSource={recentProjects}
              renderItem={(project) => (
                <List.Item
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        style={{ backgroundColor: '#1677ff' }}
                        icon={<ProjectOutlined />}
                      />
                    }
                    title={project.name}
                    description={
                      <Space>
                        <Text type="secondary">{project.description}</Text>
                        <Text type="secondary">•</Text>
                        <Text type="secondary">{project.memberCount} 成员</Text>
                        <Text type="secondary">•</Text>
                        <Text type="secondary">{project.taskCount} 任务</Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Recent Tasks */}
        <Col span={12}>
          <Card
            title="待处理的任务"
            extra={
              <Button type="link" onClick={() => navigate('/tasks')}>
                查看全部
              </Button>
            }
          >
            <List
              dataSource={recentTasks}
              renderItem={(task) => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <Space>
                        <Text>{task.title}</Text>
                        <Tag color={getPriorityColor(task.priority)}>
                          {task.priority.toUpperCase()}
                        </Tag>
                      </Space>
                    }
                    description={
                      <Space>
                        <Text type="secondary">{task.project}</Text>
                        {task.dueDate && (
                          <>
                            <Text type="secondary">•</Text>
                            <Text type="secondary">截止: {task.dueDate}</Text>
                          </>
                        )}
                      </Space>
                    }
                  />
                  <Tag color={getStatusColor(task.status)}>
                    {getStatusText(task.status)}
                  </Tag>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default DashboardPage