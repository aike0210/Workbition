import { useState, useEffect } from 'react'
import {
  Card,
  List,
  Button,
  Space,
  Typography,
  Tag,
  Badge,
  Tabs,
  Empty,
  message,
} from 'antd'
import {
  BellOutlined,
  CheckOutlined,
  DeleteOutlined,
  SettingOutlined,
  MessageOutlined,
  ProjectOutlined,
  UserOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useNotificationStore } from '@/stores/notificationStore'
import { Notification } from '@/types'
import dayjs from 'dayjs'

const { Title, Text, Paragraph } = Typography

const notificationTypeConfig = {
  task_assigned: { icon: <UserOutlined />, color: 'blue', label: '任务分配' },
  task_commented: { icon: <MessageOutlined />, color: 'green', label: '任务评论' },
  task_mentioned: { icon: <MessageOutlined />, color: 'orange', label: '提及' },
  project_invited: { icon: <ProjectOutlined />, color: 'purple', label: '项目邀请' },
  organization_invited: { icon: <ProjectOutlined />, color: 'cyan', label: '组织邀请' },
  system: { icon: <BellOutlined />, color: 'default', label: '系统通知' },
}

const NotificationsPage = () => {
  const navigate = useNavigate()
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
  } = useNotificationStore()
  const [activeTab, setActiveTab] = useState('all')

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'unread') return !n.read
    if (activeTab === 'read') return n.read
    return true
  })

  const handleMarkAsRead = (notificationId: string) => {
    markAsRead(notificationId)
  }

  const handleMarkAllAsRead = () => {
    markAllAsRead()
    message.success('已全部标为已读')
  }

  const handleDelete = (notificationId: string) => {
    removeNotification(notificationId)
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id)
    }
    if (notification.link) {
      navigate(notification.link)
    }
  }

  const getNotificationIcon = (type: string) => {
    const config = notificationTypeConfig[type as keyof typeof notificationTypeConfig]
    return config || notificationTypeConfig.system
  }

  const tabItems = [
    {
      key: 'all',
      label: `全部 (${notifications.length})`,
    },
    {
      key: 'unread',
      label: (
        <Badge count={unreadCount} size="small" offset={[8, 0]}>
          未读
        </Badge>
      ),
    },
    {
      key: 'read',
      label: `已读 (${notifications.filter((n) => n.read).length})`,
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
            通知中心
          </Title>
          <Text type="secondary">查看和管理你的通知</Text>
        </div>
        <Space>
          {unreadCount > 0 && (
            <Button onClick={handleMarkAllAsRead}>
              全部标为已读
            </Button>
          )}
          <Button icon={<SettingOutlined />} onClick={() => navigate('/settings/notifications')}>
            通知设置
          </Button>
        </Space>
      </div>

      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
        />

        {filteredNotifications.length === 0 ? (
          <Empty
            description={
              activeTab === 'unread'
                ? '没有未读通知'
                : activeTab === 'read'
                  ? '没有已读通知'
                  : '暂无通知'
            }
            style={{ padding: '48px 0' }}
          />
        ) : (
          <List
            dataSource={filteredNotifications}
            renderItem={(notification) => {
              const typeConfig = getNotificationIcon(notification.type)
              return (
                <List.Item
                  style={{
                    backgroundColor: notification.read ? 'transparent' : '#f6ffed',
                    cursor: 'pointer',
                    padding: '12px 16px',
                  }}
                  onClick={() => handleNotificationClick(notification)}
                  actions={[
                    !notification.read && (
                      <Button
                        type="text"
                        size="small"
                        icon={<CheckOutlined />}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleMarkAsRead(notification.id)
                        }}
                      >
                        标为已读
                      </Button>
                    ),
                    <Button
                      type="text"
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(notification.id)
                      }}
                    />,
                  ].filter(Boolean)}
                >
                  <List.Item.Meta
                    avatar={
                      <Badge dot={!notification.read} offset={[-4, 4]}>
                        <Tag
                          color={typeConfig.color}
                          icon={typeConfig.icon}
                          style={{ margin: 0 }}
                        />
                      </Badge>
                    }
                    title={
                      <Space>
                        <Text strong={!notification.read}>{notification.title}</Text>
                        <Tag color={typeConfig.color}>{typeConfig.label}</Tag>
                      </Space>
                    }
                    description={
                      <div>
                        <Paragraph
                          type="secondary"
                          ellipsis={{ rows: 2 }}
                          style={{ marginBottom: 4 }}
                        >
                          {notification.content}
                        </Paragraph>
                        <Space>
                          <ClockCircleOutlined style={{ fontSize: 12 }} />
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {dayjs(notification.createdAt).fromNow()}
                          </Text>
                        </Space>
                      </div>
                    }
                  />
                </List.Item>
              )
            }}
          />
        )}
      </Card>
    </div>
  )
}

export default NotificationsPage