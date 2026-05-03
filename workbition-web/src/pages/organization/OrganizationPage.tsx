import { useState, useEffect } from 'react'
import {
  Card,
  Table,
  Button,
  Space,
  Typography,
  Tag,
  Avatar,
  Modal,
  Form,
  Input,
  message,
  Dropdown,
} from 'antd'
import {
  PlusOutlined,
  TeamOutlined,
  UserOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import { organizationApi } from '@/api'
import { Organization } from '@/types'

const { Title, Text } = Typography

const OrganizationPage = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    fetchOrganizations()
  }, [])

  const fetchOrganizations = async () => {
    setLoading(true)
    try {
      const response = await organizationApi.getOrganizations()
      setOrganizations(response.items)
    } catch (error: any) {
      message.error(error.message || '获取组织列表失败')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateOrganization = async (values: any) => {
    try {
      await organizationApi.createOrganization(values)
      message.success('组织创建成功')
      setCreateModalVisible(false)
      form.resetFields()
      fetchOrganizations()
    } catch (error: any) {
      message.error(error.message || '创建组织失败')
    }
  }

  const handleDeleteOrganization = async (orgId: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '删除组织后将无法恢复，确定要删除吗？',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await organizationApi.deleteOrganization(orgId)
          message.success('组织已删除')
          fetchOrganizations()
        } catch (error: any) {
          message.error(error.message || '删除组织失败')
        }
      },
    })
  }

  const columns = [
    {
      title: '组织名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Organization) => (
        <Space>
          <Avatar
            style={{ backgroundColor: '#1677ff' }}
            icon={<TeamOutlined />}
            src={record.logo}
          />
          <div>
            <Text strong>{name}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.description || '暂无描述'}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: '成员数',
      key: 'memberCount',
      width: 100,
      render: () => (
        <Space>
          <UserOutlined />
          <Text>5</Text>
        </Space>
      ),
    },
    {
      title: '项目数',
      key: 'projectCount',
      width: 100,
      render: () => (
        <Space>
          <TeamOutlined />
          <Text>3</Text>
        </Space>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date: string) => new Date(date).toLocaleDateString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_: any, record: Organization) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'settings',
                icon: <SettingOutlined />,
                label: '设置',
              },
              {
                key: 'members',
                icon: <TeamOutlined />,
                label: '成员管理',
              },
              {
                type: 'divider',
              },
              {
                key: 'delete',
                icon: <DeleteOutlined />,
                label: '删除',
                danger: true,
                onClick: () => handleDeleteOrganization(record.id),
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
          marginBottom: 24,
        }}
      >
        <div>
          <Title level={4} style={{ marginBottom: 0 }}>
            组织管理
          </Title>
          <Text type="secondary">管理你的团队和组织</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setCreateModalVisible(true)}
        >
          创建组织
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={organizations}
          rowKey="id"
          loading={loading}
          pagination={false}
        />
      </Card>

      <Modal
        title="创建组织"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false)
          form.resetFields()
        }}
        footer={null}
        width={520}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateOrganization}>
          <Form.Item
            name="name"
            label="组织名称"
            rules={[
              { required: true, message: '请输入组织名称' },
              { max: 50, message: '名称最多50个字符' },
            ]}
          >
            <Input placeholder="输入组织名称" />
          </Form.Item>

          <Form.Item
            name="description"
            label="组织描述"
            rules={[{ max: 500, message: '描述最多500个字符' }]}
          >
            <Input.TextArea placeholder="输入组织描述（可选）" rows={3} />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button
                onClick={() => {
                  setCreateModalVisible(false)
                  form.resetFields()
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

export default OrganizationPage