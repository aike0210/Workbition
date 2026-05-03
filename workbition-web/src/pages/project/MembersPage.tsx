import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
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
  Select,
  message,
  Popconfirm,
  Input,
} from 'antd'
import {
  PlusOutlined,
  UserOutlined,
  DeleteOutlined,
  MailOutlined,
} from '@ant-design/icons'
import { projectApi } from '@/api'
import { ProjectMember } from '@/types'

const { Title, Text } = Typography
const { Option } = Select

const roleConfig = {
  owner: { color: 'red', label: '所有者' },
  admin: { color: 'orange', label: '管理员' },
  member: { color: 'blue', label: '成员' },
  viewer: { color: 'default', label: '观察者' },
}

const MembersPage = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const [members, setMembers] = useState<ProjectMember[]>([])
  const [loading, setLoading] = useState(true)
  const [inviteModalVisible, setInviteModalVisible] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    if (projectId) {
      fetchMembers()
    }
  }, [projectId])

  const fetchMembers = async () => {
    if (!projectId) return
    setLoading(true)
    try {
      const data = await projectApi.getProjectMembers(projectId)
      setMembers(data)
    } catch (error: any) {
      message.error(error.message || '获取成员列表失败')
    } finally {
      setLoading(false)
    }
  }

  const handleInviteMember = async (values: any) => {
    if (!projectId) return
    try {
      await projectApi.addProjectMember(projectId, values)
      message.success('成员邀请成功')
      setInviteModalVisible(false)
      form.resetFields()
      fetchMembers()
    } catch (error: any) {
      message.error(error.message || '邀请成员失败')
    }
  }

  const handleUpdateRole = async (userId: string, role: string) => {
    if (!projectId) return
    try {
      await projectApi.updateProjectMember(projectId, userId, { role })
      message.success('角色更新成功')
      fetchMembers()
    } catch (error: any) {
      message.error(error.message || '更新角色失败')
    }
  }

  const handleRemoveMember = async (userId: string) => {
    if (!projectId) return
    try {
      await projectApi.removeProjectMember(projectId, userId)
      message.success('成员已移除')
      fetchMembers()
    } catch (error: any) {
      message.error(error.message || '移除成员失败')
    }
  }

  const columns = [
    {
      title: '成员',
      key: 'user',
      render: (_: any, record: ProjectMember) => (
        <Space>
          <Avatar src={record.avatarUrl} icon={<UserOutlined />} />
          <div>
            <Text strong>{record.nickname || record.username}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.email}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 120,
      render: (role: string) => {
        const config = roleConfig[role as keyof typeof roleConfig]
        return config ? <Tag color={config.color}>{config.label}</Tag> : null
      },
    },
    {
      title: '加入时间',
      dataIndex: 'joinedAt',
      key: 'joinedAt',
      width: 150,
      render: (date: string) => new Date(date).toLocaleDateString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: ProjectMember) => (
        <Space>
          {record.role !== 'owner' && (
            <>
              <Select
                value={record.role}
                onChange={(value) => handleUpdateRole(record.userId, value)}
                style={{ width: 100 }}
                size="small"
              >
                {Object.entries(roleConfig)
                  .filter(([key]) => key !== 'owner')
                  .map(([key, config]) => (
                    <Option key={key} value={key}>
                      {config.label}
                    </Option>
                  ))}
              </Select>
              <Popconfirm
                title="确定要移除该成员吗？"
                onConfirm={() => handleRemoveMember(record.userId)}
                okText="移除"
                cancelText="取消"
                okButtonProps={{ danger: true }}
              >
                <Button type="text" danger icon={<DeleteOutlined />} size="small" />
              </Popconfirm>
            </>
          )}
        </Space>
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
        <Text type="secondary">共 {members.length} 位成员</Text>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setInviteModalVisible(true)}
        >
          邀请成员
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={members}
        rowKey="id"
        loading={loading}
        pagination={false}
      />

      <Modal
        title="邀请成员"
        open={inviteModalVisible}
        onCancel={() => {
          setInviteModalVisible(false)
          form.resetFields()
        }}
        footer={null}
        width={480}
      >
        <Form form={form} layout="vertical" onFinish={handleInviteMember}>
          <Form.Item
            name="email"
            label="邮箱地址"
            rules={[
              { required: true, message: '请输入邮箱地址' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="输入成员邮箱" />
          </Form.Item>

          <Form.Item
            name="role"
            label="角色"
            initialValue="member"
          >
            <Select>
              {Object.entries(roleConfig)
                .filter(([key]) => key !== 'owner')
                .map(([key, config]) => (
                  <Option key={key} value={key}>
                    <Space>
                      <Tag color={config.color} style={{ margin: 0 }}>
                        {config.label}
                      </Tag>
                    </Space>
                  </Option>
                ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button
                onClick={() => {
                  setInviteModalVisible(false)
                  form.resetFields()
                }}
              >
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                发送邀请
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default MembersPage