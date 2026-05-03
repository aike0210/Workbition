import { Button, Typography } from 'antd'
import { InboxOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

interface EmptyStateProps {
  icon?: React.ReactNode
  title?: string
  description?: string
  actionText?: string
  onAction?: () => void
}

const EmptyState = ({
  icon,
  title = '暂无数据',
  description,
  actionText,
  onAction,
}: EmptyStateProps) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '48px 24px',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 24 }}>
        {icon || <InboxOutlined />}
      </div>
      <Title level={4} style={{ marginBottom: 8, color: '#999' }}>
        {title}
      </Title>
      {description && (
        <Text type="secondary" style={{ marginBottom: 24, maxWidth: 400 }}>
          {description}
        </Text>
      )}
      {actionText && onAction && (
        <Button type="primary" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  )
}

export default EmptyState