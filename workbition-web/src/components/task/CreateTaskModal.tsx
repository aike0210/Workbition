import { useState } from 'react'
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Space,
  Tag,
  Typography,
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { Task } from '@/types'

const { Text } = Typography
const { Option } = Select
const { TextArea } = Input

interface CreateTaskModalProps {
  visible: boolean
  taskListId: string
  onSubmit: (values: Partial<Task>) => Promise<void>
  onCancel: () => void
}

const priorityOptions = [
  { value: 'urgent', label: '紧急', color: 'red' },
  { value: 'high', label: '高', color: 'orange' },
  { value: 'medium', label: '中', color: 'blue' },
  { value: 'low', label: '低', color: 'green' },
]

const statusOptions = [
  { value: 'todo', label: '待办' },
  { value: 'in_progress', label: '进行中' },
  { value: 'done', label: '已完成' },
]

const CreateTaskModal = ({ visible, taskListId, onSubmit, onCancel }: CreateTaskModalProps) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')

  const handleSubmit = async (values: any) => {
    setLoading(true)
    try {
      await onSubmit({
        ...values,
        tags,
        dueDate: values.dueDate?.toISOString(),
      })
      form.resetFields()
      setTags([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddTag = () => {
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  return (
    <Modal
      title="创建任务"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={520}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          priority: 'medium',
          status: 'todo',
        }}
      >
        <Form.Item
          name="title"
          label="任务标题"
          rules={[
            { required: true, message: '请输入任务标题' },
            { max: 100, message: '标题最多100个字符' },
          ]}
        >
          <Input placeholder="输入任务标题" autoFocus />
        </Form.Item>

        <Form.Item
          name="description"
          label="任务描述"
          rules={[{ max: 2000, message: '描述最多2000个字符' }]}
        >
          <TextArea
            placeholder="输入任务描述（可选）"
            rows={3}
            showCount
            maxLength={2000}
          />
        </Form.Item>

        <div style={{ display: 'flex', gap: 16 }}>
          <Form.Item
            name="priority"
            label="优先级"
            style={{ flex: 1 }}
          >
            <Select placeholder="选择优先级">
              {priorityOptions.map((option) => (
                <Option key={option.value} value={option.value}>
                  <Space>
                    <Tag color={option.color} style={{ margin: 0 }}>
                      {option.label}
                    </Tag>
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="状态"
            style={{ flex: 1 }}
          >
            <Select placeholder="选择状态">
              {statusOptions.map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </div>

        <div style={{ display: 'flex', gap: 16 }}>
          <Form.Item
            name="assigneeId"
            label="负责人"
            style={{ flex: 1 }}
          >
            <Select placeholder="选择负责人" allowClear>
              {/* TODO: Load project members */}
              <Option value="user1">张三</Option>
              <Option value="user2">李四</Option>
              <Option value="user3">王五</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="dueDate"
            label="截止日期"
            style={{ flex: 1 }}
          >
            <DatePicker
              style={{ width: '100%' }}
              placeholder="选择截止日期"
              format="YYYY-MM-DD"
            />
          </Form.Item>
        </div>

        <Form.Item label="标签">
          <Space direction="vertical" style={{ width: '100%' }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="输入标签"
                onPressEnter={handleAddTag}
                style={{ flex: 1 }}
              />
              <Button
                icon={<PlusOutlined />}
                onClick={handleAddTag}
                disabled={!tagInput}
              >
                添加
              </Button>
            </div>
            {tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {tags.map((tag) => (
                  <Tag
                    key={tag}
                    closable
                    onClose={() => handleRemoveTag(tag)}
                  >
                    {tag}
                  </Tag>
                ))}
              </div>
            )}
          </Space>
        </Form.Item>

        <Form.Item>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={onCancel}>取消</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              创建任务
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default CreateTaskModal