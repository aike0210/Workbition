import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
  message,
  Tabs,
  List,
  Avatar,
  Badge,
  Descriptions,
} from 'antd'
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  FileTextOutlined,
  SwapOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input

interface Approval {
  id: string
  taskId: string
  taskTitle: string
  projectName: string
  type: 'or_sign' | 'and_sign' | 'sequential'
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  creatorId: string
  creatorName: string
  creatorAvatar?: string
  reason: string
  fromStatus: string
  toStatus: string
  createdAt: string
  completedAt?: string
}

interface ApprovalDetail {
  id: string
  approvalId: string
  approverId: string
  approverName: string
  approverAvatar?: string
  sequence: number
  status: 'pending' | 'approved' | 'rejected'
  opinion?: string
  operatedAt?: string
}

const approvalTypeLabels: Record<string, string> = {
  or_sign: '或签',
  and_sign: '会签',
  sequential: '依次审批',
}

const approvalStatusLabels: Record<string, string> = {
  pending: '待审批',
  approved: '已通过',
  rejected: '已驳回',
  cancelled: '已取消',
}

const approvalStatusColors: Record<string, string> = {
  pending: 'processing',
  approved: 'success',
  rejected: 'error',
  cancelled: 'default',
}

const ApprovalListPage = () => {
  const navigate = useNavigate()
  const [approvals, setApprovals] = useState<Approval[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('pending')
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(
    null
  )
  const [approvalDetails, setApprovalDetails] = useState<ApprovalDetail[]>([])
  const [opinionForm] = Form.useForm()

  // Mock data
  useEffect(() => {
    setApprovals([
      {
        id: '1',
        taskId: '101',
        taskTitle: '完成用户认证模块',
        projectName: 'Workbition 开发',
        type: 'or_sign',
        status: 'pending',
        creatorId: 'user1',
        creatorName: '张三',
        reason: '需要将任务状态从进行中变更为已完成',
        fromStatus: '进行中',
        toStatus: '已完成',
        createdAt: '2026-05-03T14:00:00Z',
      },
      {
        id: '2',
        taskId: '102',
        taskTitle: '设计首页 UI',
        projectName: 'Workbition 开发',
        type: 'and_sign',
        status: 'pending',
        creatorId: 'user2',
        creatorName: '李四',
        reason: '需要多人审核通过后才能完成设计任务',
        fromStatus: '审核中',
        toStatus: '已完成',
        createdAt: '2026-05-03T10:00:00Z',
      },
      {
        id: '3',
        taskId: '103',
        taskTitle: '编写 API 文档',
        projectName: 'Workbition 开发',
        type: 'sequential',
        status: 'approved',
        creatorId: 'user3',
        creatorName: '王五',
        reason: '按顺序审批',
        fromStatus: '进行中',
        toStatus: '已完成',
        createdAt: '2026-05-02T16:00:00Z',
        completedAt: '2026-05-03T09:00:00Z',
      },
    ])
    setLoading(false)
  }, [])

  // Mock approval details
  const fetchApprovalDetails = (approvalId: string) => {
    setApprovalDetails([
      {
        id: '1',
        approvalId,
        approverId: 'user1',
        approverName: '张三',
        sequence: 1,
        status: 'pending',
      },
      {
        id: '2',
        approvalId,
        approverId: 'user2',
        approverName: '李四',
        sequence: 2,
        status: 'pending',
      },
    ])
  }

  // Open detail modal
  const handleOpenDetail = (approval: Approval) => {
    setSelectedApproval(approval)
    fetchApprovalDetails(approval.id)
    setDetailModalVisible(true)
  }

  // Approve
  const handleApprove = async (values: any) => {
    if (!selectedApproval) return
    setApprovals((prev) =>
      prev.map((a) =>
        a.id === selectedApproval.id
          ? { ...a, status: 'approved', completedAt: new Date().toISOString() }
          : a
      )
    )
    message.success('审批通过')
    setDetailModalVisible(false)
    opinionForm.resetFields()
  }

  // Reject
  const handleReject = async (values: any) => {
    if (!selectedApproval) return
    setApprovals((prev) =>
      prev.map((a) =>
        a.id === selectedApproval.id
          ? { ...a, status: 'rejected', completedAt: new Date().toISOString() }
          : a
      )
    )
    message.success('已驳回')
    setDetailModalVisible(false)
    opinionForm.resetFields()
  }

  // Filter approvals
  const filteredApprovals = approvals.filter((a) => {
    if (activeTab === 'pending') return a.status === 'pending'
    if (activeTab === 'completed')
      return a.status === 'approved' || a.status === 'rejected'
    if (activeTab === 'mine') return a.creatorId === 'current_user'
    return true
  })

  // Table columns
  const columns: ColumnsType<Approval> = [
    {
      title: '任务',
      key: 'task',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.taskTitle}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.projectName}
          </Text>
        </Space>
      ),
    },
    {
      title: '审批类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type) => <Tag>{approvalTypeLabels[type]}</Tag>,
    },
    {
      title: '状态流转',
      key: 'transition',
      width: 180,
      render: (_, record) => (
        <Space>
          <Tag>{record.fromStatus}</Tag>
          <Text type="secondary">→</Text>
          <Tag>{record.toStatus}</Tag>
        </Space>
      ),
    },
    {
      title: '发起人',
      key: 'creator',
      width: 120,
      render: (_, record) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          <Text>{record.creatorName}</Text>
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={approvalStatusColors[status]}>
          {approvalStatusLabels[status]}
        </Tag>
      ),
    },
    {
      title: '发起时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date) => new Date(date).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Button type="link" onClick={() => handleOpenDetail(record)}>
          {record.status === 'pending' ? '审批' : '查看'}
        </Button>
      ),
    },
  ]

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ marginBottom: 0 }}>
          审批中心
        </Title>
        <Text type="secondary">查看和处理审批请求</Text>
      </div>

      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'pending',
              label: (
                <Badge count={approvals.filter((a) => a.status === 'pending').length}>
                  <span>待我审批</span>
                </Badge>
              ),
            },
            { key: 'completed', label: '已完成' },
            { key: 'mine', label: '我发起的' },
            { key: 'all', label: '全部' },
          ]}
        />

        <Table
          columns={columns}
          dataSource={activeTab === 'all' ? approvals : filteredApprovals}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Approval Detail Modal */}
      <Modal
        title="审批详情"
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false)
          opinionForm.resetFields()
        }}
        footer={null}
        width={640}
      >
        {selectedApproval && (
          <div>
            <Descriptions column={2} style={{ marginBottom: 24 }}>
              <Descriptions.Item label="任务">
                {selectedApproval.taskTitle}
              </Descriptions.Item>
              <Descriptions.Item label="项目">
                {selectedApproval.projectName}
              </Descriptions.Item>
              <Descriptions.Item label="审批类型">
                <Tag>{approvalTypeLabels[selectedApproval.type]}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={approvalStatusColors[selectedApproval.status]}>
                  {approvalStatusLabels[selectedApproval.status]}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="状态流转" span={2}>
                <Space>
                  <Tag>{selectedApproval.fromStatus}</Tag>
                  <Text type="secondary">→</Text>
                  <Tag>{selectedApproval.toStatus}</Tag>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="发起原因" span={2}>
                {selectedApproval.reason}
              </Descriptions.Item>
            </Descriptions>

            <Title level={5}>审批人</Title>
            <List
              dataSource={approvalDetails}
              renderItem={(detail) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar icon={<UserOutlined />} />
                    }
                    title={
                      <Space>
                        <Text>{detail.approverName}</Text>
                        <Text type="secondary">#{detail.sequence}</Text>
                      </Space>
                    }
                    description={
                      <Tag
                        color={
                          detail.status === 'approved'
                            ? 'success'
                            : detail.status === 'rejected'
                              ? 'error'
                              : 'processing'
                        }
                      >
                        {detail.status === 'approved'
                          ? '已通过'
                          : detail.status === 'rejected'
                            ? '已驳回'
                            : '待审批'}
                      </Tag>
                    }
                  />
                </List.Item>
              )}
            />

            {selectedApproval.status === 'pending' && (
              <>
                <Divider />
                <Form form={opinionForm} layout="vertical">
                  <Form.Item name="opinion" label="审批意见">
                    <TextArea placeholder="输入审批意见（可选）" rows={3} />
                  </Form.Item>
                  <Space>
                    <Button
                      type="primary"
                      icon={<CheckCircleOutlined />}
                      onClick={() => handleApprove(opinionForm.getFieldsValue())}
                    >
                      通过
                    </Button>
                    <Button
                      danger
                      icon={<CloseCircleOutlined />}
                      onClick={() => handleReject(opinionForm.getFieldsValue())}
                    >
                      驳回
                    </Button>
                  </Space>
                </Form>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default ApprovalListPage