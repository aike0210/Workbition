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
  message,
  Popconfirm,
  Switch,
  Divider,
  List,
  Badge,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  DragOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

const { Title, Text, Paragraph } = Typography
const { Option } = Select
const { TextArea } = Input

interface WorkflowState {
  id: string
  name: string
  color: string
  type: 'start' | 'normal' | 'end'
  position: number
}

interface WorkflowTransition {
  id: string
  name: string
  fromStateId: string
  toStateId: string
  requiresApproval: boolean
  conditions?: string
}

interface Workflow {
  id: string
  name: string
  description: string
  isDefault: boolean
  states: WorkflowState[]
  transitions: WorkflowTransition[]
  createdAt: string
}

const stateColors: Record<string, string> = {
  start: 'green',
  normal: 'blue',
  end: 'red',
}

const stateTypeLabels: Record<string, string> = {
  start: '开始',
  normal: '进行中',
  end: '结束',
}

const WorkflowConfigPage = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [loading, setLoading] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [stateModalVisible, setStateModalVisible] = useState(false)
  const [transitionModalVisible, setTransitionModalVisible] = useState(false)
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null)
  const [form] = Form.useForm()
  const [stateForm] = Form.useForm()
  const [transitionForm] = Form.useForm()

  // Mock data
  useEffect(() => {
    setWorkflows([
      {
        id: '1',
        name: '默认工作流',
        description: '适用于大多数项目的标准工作流',
        isDefault: true,
        states: [
          { id: '1', name: '待办', color: '#d9d9d9', type: 'start', position: 0 },
          { id: '2', name: '进行中', color: '#1677ff', type: 'normal', position: 1 },
          { id: '3', name: '已完成', color: '#52c41a', type: 'end', position: 2 },
        ],
        transitions: [
          { id: '1', name: '开始处理', fromStateId: '1', toStateId: '2', requiresApproval: false },
          { id: '2', name: '完成任务', fromStateId: '2', toStateId: '3', requiresApproval: false },
        ],
        createdAt: '2026-05-03T10:00:00Z',
      },
    ])
    setLoading(false)
  }, [])

  // Create workflow
  const handleCreateWorkflow = async (values: any) => {
    const newWorkflow: Workflow = {
      id: Date.now().toString(),
      ...values,
      isDefault: false,
      states: [
        { id: '1', name: '待办', color: '#d9d9d9', type: 'start', position: 0 },
        { id: '2', name: '进行中', color: '#1677ff', type: 'normal', position: 1 },
        { id: '3', name: '已完成', color: '#52c41a', type: 'end', position: 2 },
      ],
      transitions: [
        { id: '1', name: '开始处理', fromStateId: '1', toStateId: '2', requiresApproval: false },
        { id: '2', name: '完成任务', fromStateId: '2', toStateId: '3', requiresApproval: false },
      ],
      createdAt: new Date().toISOString(),
    }
    setWorkflows((prev) => [...prev, newWorkflow])
    message.success('工作流创建成功')
    setModalVisible(false)
    form.resetFields()
  }

  // Delete workflow
  const handleDeleteWorkflow = (workflowId: string) => {
    setWorkflows((prev) => prev.filter((w) => w.id !== workflowId))
    message.success('工作流已删除')
  }

  // Add state
  const handleAddState = (values: any) => {
    if (!selectedWorkflow) return
    const newState: WorkflowState = {
      id: Date.now().toString(),
      ...values,
      position: selectedWorkflow.states.length,
    }
    setWorkflows((prev) =>
      prev.map((w) =>
        w.id === selectedWorkflow.id
          ? { ...w, states: [...w.states, newState] }
          : w
      )
    )
    message.success('状态添加成功')
    setStateModalVisible(false)
    stateForm.resetFields()
  }

  // Add transition
  const handleAddTransition = (values: any) => {
    if (!selectedWorkflow) return
    const newTransition: WorkflowTransition = {
      id: Date.now().toString(),
      ...values,
    }
    setWorkflows((prev) =>
      prev.map((w) =>
        w.id === selectedWorkflow.id
          ? { ...w, transitions: [...w.transitions, newTransition] }
          : w
      )
    )
    message.success('流转规则添加成功')
    setTransitionModalVisible(false)
    transitionForm.resetFields()
  }

  // Workflow list columns
  const workflowColumns: ColumnsType<Workflow> = [
    {
      title: '工作流名称',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <Space>
          <Text strong>{name}</Text>
          {record.isDefault && <Tag color="blue">默认</Tag>}
        </Space>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '状态数',
      key: 'stateCount',
      width: 100,
      render: (_, record) => record.states.length,
    },
    {
      title: '流转规则数',
      key: 'transitionCount',
      width: 120,
      render: (_, record) => record.transitions.length,
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => {
              setSelectedWorkflow(record)
            }}
          >
            配置
          </Button>
          {!record.isDefault && (
            <Popconfirm
              title="确定要删除这个工作流吗？"
              onConfirm={() => handleDeleteWorkflow(record.id)}
            >
              <Button type="link" danger icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
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
          marginBottom: 24,
        }}
      >
        <div>
          <Title level={4} style={{ marginBottom: 0 }}>
            工作流配置
          </Title>
          <Text type="secondary">管理项目的工作流状态和流转规则</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setModalVisible(true)}
        >
          创建工作流
        </Button>
      </div>

      {/* Workflow List */}
      <Card style={{ marginBottom: 16 }}>
        <Table
          columns={workflowColumns}
          dataSource={workflows}
          rowKey="id"
          loading={loading}
          pagination={false}
        />
      </Card>

      {/* Selected Workflow Detail */}
      {selectedWorkflow && (
        <Card title={`工作流配置：${selectedWorkflow.name}`}>
          {/* States */}
          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <Title level={5} style={{ marginBottom: 0 }}>
                状态列表
              </Title>
              <Button
                icon={<PlusOutlined />}
                onClick={() => setStateModalVisible(true)}
              >
                添加状态
              </Button>
            </div>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {selectedWorkflow.states.map((state, index) => (
                <Card
                  key={state.id}
                  size="small"
                  style={{ minWidth: 150 }}
                >
                  <Space>
                    <Badge color={state.color} />
                    <Text strong>{state.name}</Text>
                    <Tag color={stateColors[state.type]}>
                      {stateTypeLabels[state.type]}
                    </Tag>
                  </Space>
                </Card>
              ))}
            </div>
          </div>

          <Divider />

          {/* Transitions */}
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <Title level={5} style={{ marginBottom: 0 }}>
                流转规则
              </Title>
              <Button
                icon={<PlusOutlined />}
                onClick={() => setTransitionModalVisible(true)}
              >
                添加规则
              </Button>
            </div>

            <List
              dataSource={selectedWorkflow.transitions}
              renderItem={(transition) => {
                const fromState = selectedWorkflow.states.find(
                  (s) => s.id === transition.fromStateId
                )
                const toState = selectedWorkflow.states.find(
                  (s) => s.id === transition.toStateId
                )
                return (
                  <List.Item
                    actions={[
                      <Button type="link" icon={<EditOutlined />}>
                        编辑
                      </Button>,
                      <Button type="link" danger icon={<DeleteOutlined />}>
                        删除
                      </Button>,
                    ]}
                  >
                    <Space>
                      <Tag>{fromState?.name}</Tag>
                      <ArrowRightOutlined />
                      <Tag>{toState?.name}</Tag>
                      <Text type="secondary">({transition.name})</Text>
                      {transition.requiresApproval && (
                        <Tag color="orange">需要审批</Tag>
                      )}
                    </Space>
                  </List.Item>
                )
              }}
            />
          </div>
        </Card>
      )}

      {/* Create Workflow Modal */}
      <Modal
        title="创建工作流"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false)
          form.resetFields()
        }}
        footer={null}
        width={520}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateWorkflow}>
          <Form.Item
            name="name"
            label="工作流名称"
            rules={[{ required: true, message: '请输入工作流名称' }]}
          >
            <Input placeholder="输入工作流名称" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <TextArea placeholder="输入工作流描述（可选）" rows={3} />
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

      {/* Add State Modal */}
      <Modal
        title="添加状态"
        open={stateModalVisible}
        onCancel={() => {
          setStateModalVisible(false)
          stateForm.resetFields()
        }}
        footer={null}
        width={480}
      >
        <Form form={stateForm} layout="vertical" onFinish={handleAddState}>
          <Form.Item
            name="name"
            label="状态名称"
            rules={[{ required: true, message: '请输入状态名称' }]}
          >
            <Input placeholder="输入状态名称" />
          </Form.Item>
          <Form.Item
            name="color"
            label="颜色"
            rules={[{ required: true, message: '请选择颜色' }]}
          >
            <Select placeholder="选择颜色">
              <Option value="#d9d9d9">灰色</Option>
              <Option value="#1677ff">蓝色</Option>
              <Option value="#52c41a">绿色</Option>
              <Option value="#faad14">黄色</Option>
              <Option value="#ff4d4f">红色</Option>
              <Option value="#722ed1">紫色</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="type"
            label="状态类型"
            rules={[{ required: true, message: '请选择状态类型' }]}
          >
            <Select placeholder="选择状态类型">
              <Option value="start">开始</Option>
              <Option value="normal">进行中</Option>
              <Option value="end">结束</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setStateModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">
                添加
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Add Transition Modal */}
      <Modal
        title="添加流转规则"
        open={transitionModalVisible}
        onCancel={() => {
          setTransitionModalVisible(false)
          transitionForm.resetFields()
        }}
        footer={null}
        width={520}
      >
        <Form
          form={transitionForm}
          layout="vertical"
          onFinish={handleAddTransition}
        >
          <Form.Item
            name="name"
            label="规则名称"
            rules={[{ required: true, message: '请输入规则名称' }]}
          >
            <Input placeholder="输入规则名称" />
          </Form.Item>
          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item
              name="fromStateId"
              label="起始状态"
              rules={[{ required: true, message: '请选择起始状态' }]}
              style={{ flex: 1 }}
            >
              <Select placeholder="选择起始状态">
                {selectedWorkflow?.states.map((state) => (
                  <Option key={state.id} value={state.id}>
                    {state.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="toStateId"
              label="目标状态"
              rules={[{ required: true, message: '请选择目标状态' }]}
              style={{ flex: 1 }}
            >
              <Select placeholder="选择目标状态">
                {selectedWorkflow?.states.map((state) => (
                  <Option key={state.id} value={state.id}>
                    {state.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>
          <Form.Item
            name="requiresApproval"
            label="需要审批"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          <Form.Item name="conditions" label="流转条件">
            <TextArea placeholder="输入流转条件（可选）" rows={2} />
          </Form.Item>
          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setTransitionModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                添加
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default WorkflowConfigPage