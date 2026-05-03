import { useState } from 'react'
import { Card, Tabs, Form, Input, Button, Upload, message, Space, Typography, Divider } from 'antd'
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  SaveOutlined,
  UploadOutlined,
} from '@ant-design/icons'
import { useAuthStore } from '@/stores/authStore'
import { authApi } from '@/api'
import NotificationSettingsPage from './NotificationSettingsPage'

const { Title, Text } = Typography

const SettingsPage = () => {
  const { user, setUser } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [profileForm] = Form.useForm()
  const [passwordForm] = Form.useForm()

  // Update profile
  const handleUpdateProfile = async (values: any) => {
    setLoading(true)
    try {
      const updatedUser = await authApi.updateProfile(values)
      setUser(updatedUser)
      message.success('个人资料更新成功')
    } catch (error: any) {
      message.error(error.message || '更新失败')
    } finally {
      setLoading(false)
    }
  }

  // Change password
  const handleChangePassword = async (values: any) => {
    setPasswordLoading(true)
    try {
      await authApi.changePassword(values.oldPassword, values.newPassword)
      message.success('密码修改成功')
      passwordForm.resetFields()
    } catch (error: any) {
      message.error(error.message || '密码修改失败')
    } finally {
      setPasswordLoading(false)
    }
  }

  const tabItems = [
    {
      key: 'profile',
      label: '个人资料',
      children: (
        <div style={{ maxWidth: 600 }}>
          <Form
            form={profileForm}
            layout="vertical"
            initialValues={{
              username: user?.username,
              nickname: user?.nickname,
              email: user?.email,
            }}
            onFinish={handleUpdateProfile}
          >
            <Form.Item label="头像">
              <Upload
                name="avatar"
                listType="picture-circle"
                showUploadList={false}
                action="/api/v1/users/me/avatar"
              >
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>上传头像</div>
                </div>
              </Upload>
            </Form.Item>

            <Form.Item
              name="username"
              label="用户名"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input prefix={<UserOutlined />} disabled />
            </Form.Item>

            <Form.Item
              name="nickname"
              label="昵称"
              rules={[{ max: 20, message: '昵称最多20个字符' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="设置昵称" />
            </Form.Item>

            <Form.Item
              name="email"
              label="邮箱"
              rules={[
                { required: true, message: '请输入邮箱' },
                { type: 'email', message: '请输入有效的邮箱地址' },
              ]}
            >
              <Input prefix={<MailOutlined />} />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<SaveOutlined />}
              >
                保存修改
              </Button>
            </Form.Item>
          </Form>
        </div>
      ),
    },
    {
      key: 'security',
      label: '账号安全',
      children: (
        <div style={{ maxWidth: 600 }}>
          <Title level={5}>修改密码</Title>
          <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
            定期修改密码可以提高账号安全性
          </Text>

          <Form
            form={passwordForm}
            layout="vertical"
            onFinish={handleChangePassword}
          >
            <Form.Item
              name="oldPassword"
              label="当前密码"
              rules={[{ required: true, message: '请输入当前密码' }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="输入当前密码" />
            </Form.Item>

            <Form.Item
              name="newPassword"
              label="新密码"
              rules={[
                { required: true, message: '请输入新密码' },
                { min: 8, message: '密码至少8个字符' },
                {
                  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                  message: '密码必须包含大小写字母和数字',
                },
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="输入新密码" />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="确认新密码"
              dependencies={['newPassword']}
              rules={[
                { required: true, message: '请确认新密码' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve()
                    }
                    return Promise.reject(new Error('两次输入的密码不一致'))
                  },
                }),
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="再次输入新密码" />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={passwordLoading}
                icon={<SaveOutlined />}
              >
                修改密码
              </Button>
            </Form.Item>
          </Form>

          <Divider />

          <Title level={5}>账号操作</Title>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text strong>退出登录</Text>
                <br />
                <Text type="secondary">退出当前设备的登录状态</Text>
              </div>
              <Button danger>退出登录</Button>
            </div>
            <Divider style={{ margin: '12px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text strong style={{ color: '#ff4d4f' }}>注销账号</Text>
                <br />
                <Text type="secondary">永久删除账号及所有数据，此操作不可恢复</Text>
              </div>
              <Button danger ghost>注销账号</Button>
            </div>
          </Space>
        </div>
      ),
    },
    {
      key: 'notification',
      label: '通知设置',
      children: <NotificationSettingsPage />,
    },
  ]

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ marginBottom: 0 }}>
          账号设置
        </Title>
        <Text type="secondary">管理你的个人信息和账号安全</Text>
      </div>

      <Card>
        <Tabs items={tabItems} />
      </Card>
    </div>
  )
}

export default SettingsPage