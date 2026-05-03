import { useState } from 'react'
import {
  Card,
  Form,
  Switch,
  Select,
  Button,
  Space,
  Typography,
  Divider,
  message,
} from 'antd'
import { SaveOutlined, BellOutlined, MailOutlined, DesktopOutlined } from '@ant-design/icons'

const { Title, Text, Paragraph } = Typography
const { Option } = Select

const NotificationSettingsPage = () => {
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  const handleSave = async (values: any) => {
    setLoading(true)
    try {
      // TODO: Save notification settings
      await new Promise((resolve) => setTimeout(resolve, 1000))
      message.success('通知设置已保存')
    } catch (error) {
      message.error('保存失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ marginBottom: 0 }}>
          通知设置
        </Title>
        <Text type="secondary">管理你的通知偏好</Text>
      </div>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{
            emailNotifications: true,
            browserNotifications: true,
            taskAssigned: true,
            taskCommented: true,
            taskMentioned: true,
            projectInvited: true,
            systemNotifications: true,
            digestFrequency: 'daily',
          }}
          style={{ maxWidth: 600 }}
        >
          <Title level={5}>
            <BellOutlined style={{ marginRight: 8 }} />
            通知渠道
          </Title>
          <Paragraph type="secondary">
            选择你希望接收通知的方式
          </Paragraph>

          <Form.Item
            name="emailNotifications"
            label="邮件通知"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="browserNotifications"
            label="浏览器通知"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Divider />

          <Title level={5}>通知类型</Title>
          <Paragraph type="secondary">
            选择你希望接收的通知类型
          </Paragraph>

          <Form.Item
            name="taskAssigned"
            label="任务分配"
            extra="当有新任务分配给你时通知"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="taskCommented"
            label="任务评论"
            extra="当你关注的任务有新评论时通知"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="taskMentioned"
            label="提及"
            extra="当有人在评论中提及你时通知"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="projectInvited"
            label="项目邀请"
            extra="当你被邀请加入项目时通知"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="systemNotifications"
            label="系统通知"
            extra="系统维护、更新等通知"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Divider />

          <Title level={5}>摘要频率</Title>
          <Paragraph type="secondary">
            选择接收通知摘要的频率
          </Paragraph>

          <Form.Item
            name="digestFrequency"
            label="摘要频率"
          >
            <Select>
              <Option value="realtime">实时</Option>
              <Option value="daily">每日</Option>
              <Option value="weekly">每周</Option>
              <Option value="never">从不</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<SaveOutlined />}
            >
              保存设置
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default NotificationSettingsPage