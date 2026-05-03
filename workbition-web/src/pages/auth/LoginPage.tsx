import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Form, Input, Button, Card, Typography, message, Divider, Space } from 'antd'
import { UserOutlined, LockOutlined, GithubOutlined, GoogleOutlined } from '@ant-design/icons'
import { useAuthStore } from '@/stores/authStore'
import { authApi } from '@/api'

const { Title, Text } = Typography

interface LoginFormValues {
  emailOrUsername: string
  password: string
}

const LoginPage = () => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login, setToken } = useAuthStore()

  const onFinish = async (values: LoginFormValues) => {
    setLoading(true)
    try {
      // Step 1: Get tokens from backend
      const tokenResponse = await authApi.login(values)
      setToken(tokenResponse.accessToken)

      // Step 2: Fetch current user info
      const user = await authApi.getCurrentUser()
      login(user, tokenResponse.accessToken)

      message.success('登录成功')
      navigate('/dashboard')
    } catch (error: any) {
      const status = error.response?.status
      if (status === 404) {
        message.error('登录服务暂不可用，请确认后端服务已启动')
      } else if (status === 401) {
        message.error('用户名或密码错误')
      } else if (status === 400) {
        message.error(error.response?.data?.message || '请求参数错误')
      } else {
        message.error(error.message || '登录失败，请稍后重试')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Card
        style={{
          width: 400,
          borderRadius: 12,
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={2} style={{ marginBottom: 8 }}>
            Workbition
          </Title>
          <Text type="secondary">团队协作与项目管理平台</Text>
        </div>

        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
          layout="vertical"
        >
          <Form.Item
            name="emailOrUsername"
            rules={[{ required: true, message: '请输入用户名或邮箱' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="用户名或邮箱"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
            />
          </Form.Item>

          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Link to="/forgot-password">忘记密码？</Link>
              <Link to="/register">注册账号</Link>
            </div>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              登录
            </Button>
          </Form.Item>
        </Form>

        <Divider plain>
          <Text type="secondary">其他登录方式</Text>
        </Divider>

        <Space style={{ width: '100%', justifyContent: 'center' }}>
          <Button shape="circle" icon={<GithubOutlined />} size="large" />
          <Button shape="circle" icon={<GoogleOutlined />} size="large" />
        </Space>
      </Card>
    </div>
  )
}

export default LoginPage