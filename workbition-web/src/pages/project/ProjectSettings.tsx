import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Space,
  Typography,
  message,
  Popconfirm,
  Divider,
  Tabs,
} from 'antd'
import {
  SaveOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons'
import { projectApi } from '@/api'
import { Project } from '@/types'

const { Title, Text, Paragraph } = Typography
const { Option } = Select
const { TextArea } = Input

const ProjectSettings = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    if (projectId) {
      fetchProject()
    }
  }, [projectId])

  const fetchProject = async () => {
    if (!projectId) return
    setLoading(true)
    try {
      const data = await projectApi.getProject(projectId)
      setProject(data)
      form.setFieldsValue({
        name: data.name,
        description: data.description,
        visibility: data.visibility,
      })
    } catch (error: any) {
      message.error(error.message || '获取项目信息失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (values: any) => {
    if (!projectId) return
    setSaving(true)
    try {
      await projectApi.updateProject(projectId, values)
      message.success('项目设置已保存')
      fetchProject()
    } catch (error: any) {
      message.error(error.message || '保存失败')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!projectId) return
    try {
      await projectApi.deleteProject(projectId)
      message.success('项目已删除')
      navigate('/projects')
    } catch (error: any) {
      message.error(error.message || '删除项目失败')
    }
  }

  const tabItems = [
    {
      key: 'general',
      label: '基本设置',
      children: (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          style={{ maxWidth: 600 }}
        >
          <Form.Item
            name="name"
            label="项目名称"
            rules={[
              { required: true, message: '请输入项目名称' },
              { max: 50, message: '名称最多50个字符' },
            ]}
          >
            <Input placeholder="输入项目名称" />
          </Form.Item>

          <Form.Item
            name="description"
            label="项目描述"
            rules={[{ max: 500, message: '描述最多500个字符' }]}
          >
            <TextArea
              placeholder="输入项目描述（可选）"
              rows={4}
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Form.Item
            name="visibility"
            label="可见性"
          >
            <Select>
              <Option value="private">
                <Space direction="vertical" size={0}>
                  <Text>私有</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    仅项目成员可见
                  </Text>
                </Space>
              </Option>
              <Option value="public">
                <Space direction="vertical" size={0}>
                  <Text>公开</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    组织内所有人可见
                  </Text>
                </Space>
              </Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={saving}
              icon={<SaveOutlined />}
            >
              保存设置
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: 'danger',
      label: '危险操作',
      children: (
        <div style={{ maxWidth: 600 }}>
          <div style={{ marginBottom: 24 }}>
            <Title level={5} style={{ color: '#ff4d4f' }}>
              <ExclamationCircleOutlined style={{ marginRight: 8 }} />
              删除项目
            </Title>
            <Paragraph type="secondary">
              删除项目后，所有相关数据将被永久删除，包括任务、评论、附件等。此操作不可恢复。
            </Paragraph>
            <Popconfirm
              title="确定要删除这个项目吗？"
              description="删除后将无法恢复，所有数据将被永久删除。"
              onConfirm={handleDelete}
              okText="删除"
              cancelText="取消"
              okButtonProps={{ danger: true }}
            >
              <Button danger icon={<DeleteOutlined />}>
                删除项目
              </Button>
            </Popconfirm>
          </div>

          <Divider />

          <div>
            <Title level={5}>归档项目</Title>
            <Paragraph type="secondary">
              归档项目后，项目将变为只读状态，成员无法创建或编辑任务。你可以随时取消归档。
            </Paragraph>
            <Button>归档项目</Button>
          </div>
        </div>
      ),
    },
  ]

  if (loading) {
    return <Card loading />
  }

  if (!project) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: 48 }}>
          <Title level={4} style={{ color: '#999' }}>
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
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ marginBottom: 0 }}>
          项目设置
        </Title>
        <Text type="secondary">{project.name}</Text>
      </div>

      <Card>
        <Tabs items={tabItems} />
      </Card>
    </div>
  )
}

export default ProjectSettings