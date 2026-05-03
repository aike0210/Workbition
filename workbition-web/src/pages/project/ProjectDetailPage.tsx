import { useState, useEffect } from 'react'
import { useParams, useNavigate, Outlet, useLocation } from 'react-router-dom'
import {
  Card,
  Tabs,
  Typography,
  Space,
  Button,
  Tag,
  Avatar,
  Descriptions,
  Skeleton,
  message,
} from 'antd'
import {
  ProjectOutlined,
  TeamOutlined,
  SettingOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  CalendarOutlined,
  BarChartOutlined,
  ApartmentOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import { projectApi } from '@/api'
import { Project } from '@/types'

const { Title, Text } = Typography

const ProjectDetailPage = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (projectId) {
      fetchProject(projectId)
    }
  }, [projectId])

  const fetchProject = async (id: string) => {
    setLoading(true)
    try {
      const data = await projectApi.getProject(id)
      setProject(data)
    } catch (error: any) {
      message.error(error.message || '获取项目详情失败')
    } finally {
      setLoading(false)
    }
  }

  const getActiveTab = () => {
    const path = location.pathname
    if (path.endsWith(`/projects/${projectId}`) || path.endsWith(`/projects/${projectId}/`)) return 'overview'
    if (path.includes('/board')) return 'board'
    if (path.includes('/list')) return 'list'
    if (path.includes('/calendar')) return 'calendar'
    if (path.includes('/gantt')) return 'gantt'
    if (path.includes('/members')) return 'members'
    if (path.includes('/workflow')) return 'workflow'
    if (path.includes('/automation')) return 'automation'
    if (path.includes('/settings')) return 'settings'
    return 'overview'
  }

  const handleTabChange = (key: string) => {
    switch (key) {
      case 'overview':
        navigate(`/projects/${projectId}`)
        break
      case 'board':
        navigate(`/projects/${projectId}/board`)
        break
      case 'list':
        navigate(`/projects/${projectId}/list`)
        break
      case 'calendar':
        navigate(`/projects/${projectId}/calendar`)
        break
      case 'gantt':
        navigate(`/projects/${projectId}/gantt`)
        break
      case 'members':
        navigate(`/projects/${projectId}/members`)
        break
      case 'workflow':
        navigate(`/projects/${projectId}/workflow`)
        break
      case 'automation':
        navigate(`/projects/${projectId}/automation`)
        break
      case 'settings':
        navigate(`/projects/${projectId}/settings`)
        break
    }
  }

  const tabItems = [
    {
      key: 'overview',
      label: (
        <Space>
          <ProjectOutlined />
          <span>概览</span>
        </Space>
      ),
    },
    {
      key: 'board',
      label: (
        <Space>
          <AppstoreOutlined />
          <span>看板</span>
        </Space>
      ),
    },
    {
      key: 'list',
      label: (
        <Space>
          <UnorderedListOutlined />
          <span>列表</span>
        </Space>
      ),
    },
    {
      key: 'calendar',
      label: (
        <Space>
          <CalendarOutlined />
          <span>日历</span>
        </Space>
      ),
    },
    {
      key: 'gantt',
      label: (
        <Space>
          <BarChartOutlined />
          <span>甘特图</span>
        </Space>
      ),
    },
    {
      key: 'members',
      label: (
        <Space>
          <TeamOutlined />
          <span>成员</span>
        </Space>
      ),
    },
    {
      key: 'workflow',
      label: (
        <Space>
          <ApartmentOutlined />
          <span>工作流</span>
        </Space>
      ),
    },
    {
      key: 'automation',
      label: (
        <Space>
          <ThunderboltOutlined />
          <span>自动化</span>
        </Space>
      ),
    },
    {
      key: 'settings',
      label: (
        <Space>
          <SettingOutlined />
          <span>设置</span>
        </Space>
      ),
    },
  ]

  if (loading) {
    return (
      <Card>
        <Skeleton active paragraph={{ rows: 4 }} />
      </Card>
    )
  }

  if (!project) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <ProjectOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
          <Title level={4} style={{ marginTop: 16, color: '#999' }}>
            项目不存在
          </Title>
          <Button type="primary" onClick={() => navigate('/projects')}>
            返回项目列表
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <div>
      {/* Project Header */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Space align="start">
            <Avatar
              size={64}
              style={{ backgroundColor: '#1677ff' }}
              icon={<ProjectOutlined />}
            />
            <div>
              <Space>
                <Title level={3} style={{ marginBottom: 0 }}>
                  {project.name}
                </Title>
                <Tag color={project.visibility === 'public' ? 'green' : 'default'}>
                  {project.visibility === 'public' ? '公开' : '私有'}
                </Tag>
              </Space>
              <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
                {project.description || '暂无项目描述'}
              </Text>
              <Space style={{ marginTop: 12 }}>
                <Text type="secondary">
                  <TeamOutlined /> {project.memberCount ?? 0} 成员
                </Text>
                <Text type="secondary">•</Text>
                <Text type="secondary">
                  创建于 {new Date(project.createdAt).toLocaleDateString('zh-CN')}
                </Text>
              </Space>
            </div>
          </Space>
          <Button icon={<SettingOutlined />} onClick={() => navigate(`/projects/${projectId}/settings`)}>
            项目设置
          </Button>
        </div>
      </Card>

      {/* Project Content */}
      <Card>
        <Tabs
          activeKey={getActiveTab()}
          onChange={handleTabChange}
          items={tabItems}
        />
        <Outlet />
      </Card>
    </div>
  )
}

export default ProjectDetailPage