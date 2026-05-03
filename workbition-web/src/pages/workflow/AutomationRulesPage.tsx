import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import {
  Card,
  Button,
  Space,
  Typography,
  Table,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  message,
  Popconfirm,
  List,
  Divider,
  Badge,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  ThunderboltOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

const { Title, Text, Paragraph } = Typography
const { Option } = Select
const { TextArea } = Input

interface AutomationRule {
  id: string
  name: string
  description: string
  triggerType: string
  triggerConfig: string
  conditions: string
  actions: string
  isEnabled: boolean
  executionCount: number
  lastExecutedAt?: string
  createdAt: string
}

const triggerTypeLabels: Record<string, string> = {
  status_change: '状态变更',
  field_change: '字段变更',
  task_created: '任务创建',
  member_change: '成员变更',
  due_date: '截止日期',
  scheduled: '定时触发',
}

const triggerTypeColors: Record<string, string> = {
  status_change: 'blue',
  field_change: 'cyan',
  task_created: 'green',
  member_change: 'purple',
  due_date: 'orange',
  scheduled: 'red',
}

const AutomationRulesPage = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const [rules, setRules] = useState<AutomationRule[]>([])
  const [loading, setLoading] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [form] = Form.useForm()

  // Mock data
  useEffect(() => {
    setRules([
      {
        id: '1',
        name: '任务完成通知',
        description: '当任务状态变更为已完成时，发送通知给创建者',
        triggerType: 'status_change',
        triggerConfig: '{"fromStatus":"in_progress","toStatus":"done"}',
        conditions: '{}',
        actions: '[{"type":"notify","config":{"target":"creator","template":"task_completed"}}]',
        isEnabled: true,
        executionCount: 15,
        lastExecutedAt: '2026-05-03T15:30:00Z',
        createdAt: '2026-05-03T10:00:00Z',
      },
      {
        id: '2',
        name: '截止日期提醒',
        description: '每天9点检查即将到期的任务，发送提醒通知',
        triggerType: 'scheduled',
        triggerConfig: '{"cron":"0 9 * * *"}',
        conditions: '{"dueWithin":"24h"}',
        actions: '[{"type":"notify","config":{"target":"assignee","template":"due_date_reminder"}}]',
        isEnabled: true,
        executionCount: 30,
        lastExecutedAt: '2026-05-03T09:00:00Z',
        createdAt: '2026-05-01T10:00:00Z',
      },
      {
        id: '3',
        name: '自动分配任务',
        description: '当新任务创建且未指定负责人时，自动分配给项目管理员',
        triggerType: 'task_created',
        triggerConfig: '{}',
        conditions: '{"assigneeIsNull":true}',
        actions: '[{"type":"assign","config":{"target":"project_admin"}}]',
        isEnabled: false,
        executionCount: 0,
        createdAt: '2026-05-02T10:00:00Z',
      },
    ])
    setLoading(false)
  }, [])

  // Create rule
  const handleCreateRule = async (values: any) => {
    const newRule: AutomationRule = {
      id: Date.now().toString(),
      ...values,
      isEnabled: true,
      executionCount: 0,
      createdAt: new Date().toISOString(),
    }
    setRules((prev) => [...prev, newRule])
    message.success('规则创建成功')
    setModalVisible(false)
    form.resetFields()
  }

  // Toggle rule
  const handleToggleRule = (ruleId: string, enabled: boolean) => {
    setRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, isEnabled: enabled } : r))
    )
    message.success(enabled ? '规则已启用' : '规则已禁用')
  }

  // Delete rule
  const handleDeleteRule = (ruleId: string) => {
    setRules((prev) => prev.filter((r) => r.id !== ruleId))
    message.success('规则已删除')
  }

  // Table columns
  const columns: ColumnsType<AutomationRule> = [
    {
      title: '规则名称',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <Space>
          <Text strong>{name}</Text>
          {!record.isEnabled && <Tag color="default">已禁用</Tag>}
        </Space>
      ),
    },
    {
      title: '触发器',
      dataIndex: 'triggerType',
      key: 'triggerType',
      width: 120,
      render: (type) => (
        <Tag color={triggerTypeColors[type]}>
          {triggerTypeLabels[type]}
        </Tag>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '执行次数',
      dataIndex: 'executionCount',
      key: 'executionCount',
      width: 100,
      render: (count) => (
        <Space>
          <ThunderboltOutlined />
          <Text>{count}</Text>
        </Space>
      ),
    },
    {
      title: '最后执行',
      dataIndex: 'lastExecutedAt',
      key: 'lastExecutedAt',
      width: 150,
      render: (date) =>
        date ? (
          <Space>
            <ClockCircleOutlined />
            <Text type="secondary">
              {new Date(date).toLocaleString('zh-CN')}
            </Text>
          </Space>
        ) : (
          <Text type="secondary">-</Text>
        ),
    },
    {
      title: '状态',
      key: 'status',
      width: 80,
      render: (_, record) => (
        <Switch
          checked={record.isEnabled}
          onChange={(checked) => handleToggleRule(record.id, checked)}
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />}>
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个规则吗？"
            onConfirm={() => handleDeleteRule(record.id)}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
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
          marginBottom: 24,
        }}
      >
        <div>
          <Title level={4} style={{ marginBottom: 0 }}>
            自动化规则
          </Title>
          <Text type="secondary">
            配置自动化规则，当满足条件时自动执行操作
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setModalVisible(true)}
        >
          创建规则
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={rules}
          rowKey="id"
          loading={loading}
          pagination={false}
        />
      </Card>

      {/* Create Rule Modal */}
      <Modal
        title="创建自动化规则"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false)
          form.resetFields()
        }}
        footer={null}
        width={640}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateRule}>
          <Form.Item
            name="name"
            label="规则名称"
            rules={[{ required: true, message: '请输入规则名称' }]}
          >
            <Input placeholder="输入规则名称" />
          </Form.Item>

          <Form.Item name="description" label="描述">
            <TextArea placeholder="输入规则描述（可选）" rows={2} />
          </Form.Item>

          <Divider>触发器配置</Divider>

          <Form.Item
            name="triggerType"
            label="触发器类型"
            rules={[{ required: true, message: '请选择触发器类型' }]}
          >
            <Select placeholder="选择触发器类型">
              {Object.entries(triggerTypeLabels).map(([key, label]) => (
                <Option key={key} value={key}>
                  <Tag color={triggerTypeColors[key]}>{label}</Tag>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="triggerConfig" label="触发器配置">
            <TextArea placeholder='输入JSON配置，如：{"fromStatus":"todo","toStatus":"doing"}' rows={2} />
          </Form.Item>

          <Divider>条件配置</Divider>

          <Form.Item name="conditions" label="执行条件">
            <TextArea
              placeholder='输入JSON条件，如：{"assigneeIsNull":true}'
              rows={2}
            />
          </Form.Item>

          <Divider>动作配置</Divider>

          <Form.Item
            name="actions"
            label="执行动作"
            rules={[{ required: true, message: '请配置执行动作' }]}
          >
            <TextArea
              placeholder='输入JSON动作，如：[{"type":"notify","config":{"target":"assignee"}}]'
              rows={3}
            />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setModalVisible(false)}>取消</Button>
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

export default AutomationRulesPage