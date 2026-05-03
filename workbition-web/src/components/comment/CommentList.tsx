import { useState, useEffect } from 'react'
import {
  List,
  Avatar,
  Typography,
  Space,
  Button,
  Input,
  Popconfirm,
  message,
  Empty,
} from 'antd'
import {
  UserOutlined,
  DeleteOutlined,
  EditOutlined,
  SendOutlined,
} from '@ant-design/icons'
import { taskApi } from '@/api'
import { Comment } from '@/types'
import dayjs from 'dayjs'

const { Text, Paragraph } = Typography
const { TextArea } = Input

interface CommentListProps {
  taskId: string
}

const CommentList = ({ taskId }: CommentListProps) => {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [commentText, setCommentText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')

  useEffect(() => {
    fetchComments()
  }, [taskId])

  const fetchComments = async () => {
    setLoading(true)
    try {
      const data = await taskApi.getComments(taskId)
      setComments(data)
    } catch (error: any) {
      message.error(error.message || '获取评论失败')
    } finally {
      setLoading(false)
    }
  }

  // Add comment
  const handleAddComment = async () => {
    if (!commentText.trim()) return
    setSubmitting(true)
    try {
      const newComment = await taskApi.createComment(taskId, commentText)
      setComments((prev) => [...prev, newComment])
      setCommentText('')
      message.success('评论已添加')
    } catch (error: any) {
      message.error(error.message || '添加评论失败')
    } finally {
      setSubmitting(false)
    }
  }

  // Update comment
  const handleUpdateComment = async (commentId: string) => {
    if (!editText.trim()) return
    try {
      const updatedComment = await taskApi.updateComment(taskId, commentId, editText)
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? updatedComment : c))
      )
      setEditingId(null)
      setEditText('')
      message.success('评论已更新')
    } catch (error: any) {
      message.error(error.message || '更新评论失败')
    }
  }

  // Delete comment
  const handleDeleteComment = async (commentId: string) => {
    try {
      await taskApi.deleteComment(taskId, commentId)
      setComments((prev) => prev.filter((c) => c.id !== commentId))
      message.success('评论已删除')
    } catch (error: any) {
      message.error(error.message || '删除评论失败')
    }
  }

  // Start editing
  const startEditing = (comment: Comment) => {
    setEditingId(comment.id)
    setEditText(comment.content)
  }

  // Cancel editing
  const cancelEditing = () => {
    setEditingId(null)
    setEditText('')
  }

  return (
    <div>
      {/* Comment Input */}
      <div style={{ marginBottom: 24 }}>
        <TextArea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="添加评论... 使用 @ 提及成员"
          rows={3}
          style={{ marginBottom: 8 }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleAddComment}
            loading={submitting}
            disabled={!commentText.trim()}
          >
            发表评论
          </Button>
        </div>
      </div>

      {/* Comment List */}
      {comments.length === 0 ? (
        <Empty description="暂无评论" />
      ) : (
        <List
          loading={loading}
          dataSource={comments}
          renderItem={(comment) => (
            <List.Item
              actions={
                editingId === comment.id
                  ? [
                      <Button
                        type="link"
                        onClick={() => handleUpdateComment(comment.id)}
                      >
                        保存
                      </Button>,
                      <Button type="link" onClick={cancelEditing}>
                        取消
                      </Button>,
                    ]
                  : [
                      <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => startEditing(comment)}
                      >
                        编辑
                      </Button>,
                      <Popconfirm
                        title="确定要删除这条评论吗？"
                        onConfirm={() => handleDeleteComment(comment.id)}
                        okText="删除"
                        cancelText="取消"
                        okButtonProps={{ danger: true }}
                      >
                        <Button type="link" danger icon={<DeleteOutlined />}>
                          删除
                        </Button>
                      </Popconfirm>,
                    ]
              }
            >
              <List.Item.Meta
                avatar={
                  <Avatar src={comment.user.avatarUrl} icon={<UserOutlined />} />
                }
                title={
                  <Space>
                    <Text strong>
                      {comment.user.nickname || comment.user.username}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {dayjs(comment.createdAt).fromNow()}
                    </Text>
                  </Space>
                }
                description={
                  editingId === comment.id ? (
                    <TextArea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows={2}
                    />
                  ) : (
                    <Paragraph style={{ marginBottom: 0 }}>
                      {comment.content}
                    </Paragraph>
                  )
                }
              />
            </List.Item>
          )}
        />
      )}
    </div>
  )
}

export default CommentList