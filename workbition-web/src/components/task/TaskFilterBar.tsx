import { Space, Select, Button, Typography } from 'antd'
import { FilterOutlined, ClearOutlined, UserOutlined } from '@ant-design/icons'

const { Text } = Typography
const { Option } = Select

interface Filters {
  assigneeId?: string
  priority?: string
}

interface TaskFilterBarProps {
  filters: Filters
  onFilterChange: (filters: Filters) => void
}

const TaskFilterBar = ({ filters, onFilterChange }: TaskFilterBarProps) => {
  const handleAssigneeChange = (value: string | undefined) => {
    onFilterChange({ ...filters, assigneeId: value })
  }

  const handlePriorityChange = (value: string | undefined) => {
    onFilterChange({ ...filters, priority: value })
  }

  const handleClearFilters = () => {
    onFilterChange({ assigneeId: undefined, priority: undefined })
  }

  const hasFilters = filters.assigneeId || filters.priority

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        padding: '12px 0',
      }}
    >
      <Space>
        <FilterOutlined />
        <Text strong>筛选</Text>

        <Select
          placeholder="负责人"
          allowClear
          style={{ width: 140 }}
          value={filters.assigneeId}
          onChange={handleAssigneeChange}
        >
          <Option value="user1">
            <Space>
              <UserOutlined />
              <span>张三</span>
            </Space>
          </Option>
          <Option value="user2">
            <Space>
              <UserOutlined />
              <span>李四</span>
            </Space>
          </Option>
          <Option value="user3">
            <Space>
              <UserOutlined />
              <span>王五</span>
            </Space>
          </Option>
        </Select>

        <Select
          placeholder="优先级"
          allowClear
          style={{ width: 120 }}
          value={filters.priority}
          onChange={handlePriorityChange}
        >
          <Option value="urgent">
            <span style={{ color: '#ff4d4f' }}>紧急</span>
          </Option>
          <Option value="high">
            <span style={{ color: '#fa8c16' }}>高</span>
          </Option>
          <Option value="medium">
            <span style={{ color: '#1677ff' }}>中</span>
          </Option>
          <Option value="low">
            <span style={{ color: '#52c41a' }}>低</span>
          </Option>
        </Select>

        {hasFilters && (
          <Button
            type="text"
            icon={<ClearOutlined />}
            onClick={handleClearFilters}
          >
            清除筛选
          </Button>
        )}
      </Space>

      <Space>
        <Text type="secondary">
          {/* TODO: Show task count */}
        </Text>
      </Space>
    </div>
  )
}

export default TaskFilterBar