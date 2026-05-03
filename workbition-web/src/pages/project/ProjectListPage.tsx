import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Card,
  Row,
  Col,
  Button,
  Input,
  Select,
  Space,
  Typography,
  Tag,
  Avatar,
  Dropdown,
  Modal,
  Form,
  message,
  Empty,
  Spin,
} from 'antd'
import {
  PlusOutlined,
  SearchOutlined,
  ProjectOutlined,
  TeamOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  StarOutlined,
  StarFilled,
} from '@ant-design/icons'
import { projectApi } from '@/api'
import { Project } from '@/types'

const { Title, Text, Paragraph } = Typography
const { Option } = Select

const ProjectListPage = () => {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [filterVisibility, setFilterVisibility] = useState<string>('all')
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [createForm] = Form.useForm()

  // Fetch projects
  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const response = await projectApi.getProjects()
      setProjects(response.items)
    } catch (error: any) {
      message.error(error.message || '获取项目列表失败')
    } finally {
      setLoading(false)
    }
  }

  // Create project
  const handleCreateProject = async (values: any) => {
    try {
      await projectApi.createProject(values)
      message.success('项目创建成功')
      setCreateModalVisible(false)
      createForm.resetFields()
      fetchProjects()
    } catch (error: any) {
      message.error(error.message || '创建项目失败')
    }
  }

  // Delete project
  const handleDeleteProject = async (projectId: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '删除后项目将无法恢复，确定要删除吗？',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await projectApi.deleteProject(projectId)
          message.success('项目已删除')
          fetchProjects()
        } catch (error: any) {
          message.error(error.message || '删除项目失败')
        }
      },
    })
  }

  // Filter projects
  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchText.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchText.toLowerCase())
    const matchesVisibility =
      filterVisibility === 'all' || project.visibility === filterVisibility
    return matchesSearch && matchesVisibility
  })

  // Project menu items
  const getProjectMenuItems = (project: Project) => [
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: '编辑',
      onClick: () => navigate(`/projects/${project.id}/settings`),
    },
    {
      key: 'star',
      icon: <StarOutlined />,
      label: '收藏',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: '删除',
      danger: true,
      onClick: () => handleDeleteProject(project.id),
    },
  ]

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <Title level={4} style={{ marginBottom: 0 }}>
            项目列表
          </Title>
          <Text type="secondary">管理你的所有项目</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setCreateModalVisible(true)}
        >
          创建项目
        </Button>
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: 24 }}>
        <Space size={16}>
          <Input
            placeholder="搜索项目..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
          <Select
            value={filterVisibility}
            onChange={setFilterVisibility}
            style={{ width: 120 }}
          >
            <Option value="all">全部</Option>
            <Option value="public">公开</Option>
            <Option value="private">私有</Option>
          </Select>
        </Space>
      </Card>

      {/* Project Grid */}
      <Spin spinning={loading}>
        {filteredProjects.length === 0 ? (
          <Card>
            <Empty
              description={
                searchText || filterVisibility !== 'all'
                  ? '没有找到匹配的项目'
                  : '还没有项目，点击上方按钮创建第一个项目'
              }
            >
              {!searchText && filterVisibility === 'all' && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setCreateModalVisible(true)}
                >
                  创建项目
                </Button>
              )}
            </Empty>
          </Card>
        ) : (
          <Row gutter={[16, 16]}>
            {filteredProjects.map((project) => (
              <Col key={project.id} xs={24} sm={12} lg={8} xl={6}>
                <Card
                  hoverable
                  onClick={() => navigate(`/projects/${project.id}`)}
                  actions={[
                    <Dropdown
                      menu={{ items: getProjectMenuItems(project) }}
                      trigger={['click']}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreOutlined key="more" />
                    </Dropdown>,
                  ]}
                >
                  <Card.Meta
                    avatar={
                      <Avatar
                        style={{ backgroundColor: '#1677ff' }}
                        icon={<ProjectOutlined />}
                      />
                    }
                    title={
                      <Space>
                        <Text strong>{project.name}</Text>
                        <Tag color={project.visibility === 'public' ? 'green' : 'default'}>
                          {project.visibility === 'public' ? '公开' : '私有'}
                        </Tag>
                      </Space>
                    }
                    description={
                      <Paragraph
                        type="secondary"
                        ellipsis={{ rows: 2 }}
                        style={{ marginBottom: 0 }}
                      >
                        {project.description || '暂无描述'}
                      </Paragraph>
                    }
                  />
                  <div style={{ marginTop: 16 }}>
                    <Space>
                      <TeamOutlined />
                      <Text type="secondary">5 成员</Text>
                    </Space>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Spin>

      {/* Create Project Modal */}
      <Modal
        title="创建项目"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false)
          createForm.resetFields()
        }}
        footer={null}
        width={520}
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreateProject}
        >
          <Form.Item
            name="name"
            label="项目名称"
            rules={[
              { required: true, message: '请输入项目名称' },
              { max: 50, message: '项目名称最多50个字符' },
            ]}
          >
            <Input placeholder="输入项目名称" />
          </Form.Item>

          <Form.Item
            name="description"
            label="项目描述"
            rules={[{ max: 500, message: '项目描述最多500个字符' }]}
          >
            <Input.TextArea
              placeholder="输入项目描述（可选）"
              rows={3}
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Form.Item
            name="visibility"
            label="可见性"
            initialValue="private"
          >
            <Select>
              <Option value="private">
                <Space>
                  <span>私有</span>
                  <Text type="secondary">- 仅项目成员可见</Text>
                </Space>
              </Option>
              <Option value="public">
                <Space>
                  <span>公开</span>
                  <Text type="secondary">- 组织内所有人可见</Text>
                </Space>
              </Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button
                onClick={() => {
                  setCreateModalVisible(false)
                  createForm.resetFields()
                }}
              >
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                创建
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default ProjectListPage