import { useState, useEffect } from 'react'
import {
  List,
  Button,
  Typography,
  Space,
  Upload,
  message,
  Popconfirm,
  Empty,
  Tag,
  Progress,
} from 'antd'
import {
  UploadOutlined,
  DownloadOutlined,
  DeleteOutlined,
  FileOutlined,
  FileImageOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FileZipOutlined,
  PaperClipOutlined,
} from '@ant-design/icons'
import { taskApi } from '@/api'
import { Attachment } from '@/types'
import { formatFileSize } from '@/utils'
import dayjs from 'dayjs'

const { Text } = Typography

interface AttachmentListProps {
  taskId: string
}

const getFileIcon = (fileType: string) => {
  if (fileType.startsWith('image/')) return <FileImageOutlined style={{ color: '#1677ff' }} />
  if (fileType === 'application/pdf') return <FilePdfOutlined style={{ color: '#ff4d4f' }} />
  if (fileType.includes('word')) return <FileWordOutlined style={{ color: '#2b5797' }} />
  if (fileType.includes('excel') || fileType.includes('spreadsheet'))
    return <FileExcelOutlined style={{ color: '#217346' }} />
  if (fileType.includes('zip') || fileType.includes('rar'))
    return <FileZipOutlined style={{ color: '#faad14' }} />
  return <FileOutlined style={{ color: '#666' }} />
}

const AttachmentList = ({ taskId }: AttachmentListProps) => {
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  useEffect(() => {
    fetchAttachments()
  }, [taskId])

  const fetchAttachments = async () => {
    setLoading(true)
    try {
      const data = await taskApi.getAttachments(taskId)
      setAttachments(data)
    } catch (error: any) {
      message.error(error.message || '获取附件失败')
    } finally {
      setLoading(false)
    }
  }

  // Upload attachment
  const handleUpload = async (file: File) => {
    setUploading(true)
    setUploadProgress(0)

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 100)

      const newAttachment = await taskApi.uploadAttachment(taskId, file)
      setAttachments((prev) => [...prev, newAttachment])
      message.success('附件上传成功')

      clearInterval(progressInterval)
      setUploadProgress(100)
    } catch (error: any) {
      message.error(error.message || '上传失败')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }

    return false // Prevent default upload behavior
  }

  // Delete attachment
  const handleDeleteAttachment = async (attachmentId: string) => {
    try {
      await taskApi.deleteAttachment(taskId, attachmentId)
      setAttachments((prev) => prev.filter((a) => a.id !== attachmentId))
      message.success('附件已删除')
    } catch (error: any) {
      message.error(error.message || '删除失败')
    }
  }

  // Download attachment
  const handleDownload = (attachment: Attachment) => {
    const link = document.createElement('a')
    link.href = attachment.fileUrl
    link.download = attachment.fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div>
      {/* Upload Button */}
      <div style={{ marginBottom: 16 }}>
        <Upload
          beforeUpload={handleUpload}
          showUploadList={false}
          disabled={uploading}
        >
          <Button icon={<UploadOutlined />} loading={uploading}>
            上传附件
          </Button>
        </Upload>
        {uploading && (
          <Progress
            percent={uploadProgress}
            size="small"
            style={{ marginTop: 8 }}
          />
        )}
      </div>

      {/* Attachment List */}
      {attachments.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="暂无附件"
        />
      ) : (
        <List
          loading={loading}
          dataSource={attachments}
          renderItem={(attachment) => (
            <List.Item
              actions={[
                <Button
                  type="link"
                  icon={<DownloadOutlined />}
                  onClick={() => handleDownload(attachment)}
                >
                  下载
                </Button>,
                <Popconfirm
                  title="确定要删除这个附件吗？"
                  onConfirm={() => handleDeleteAttachment(attachment.id)}
                  okText="删除"
                  cancelText="取消"
                  okButtonProps={{ danger: true }}
                >
                  <Button type="link" danger icon={<DeleteOutlined />}>
                    删除
                  </Button>
                </Popconfirm>,
              ]}
            >
              <List.Item.Meta
                avatar={getFileIcon(attachment.fileType)}
                title={
                  <Space>
                    <Text>{attachment.fileName}</Text>
                    <Tag>{formatFileSize(attachment.fileSize)}</Tag>
                  </Space>
                }
                description={
                  <Space>
                    <Text type="secondary">
                      上传者：{attachment.uploadedBy.nickname || attachment.uploadedBy.username}
                    </Text>
                    <Text type="secondary">•</Text>
                    <Text type="secondary">
                      {dayjs(attachment.uploadedAt).format('YYYY-MM-DD HH:mm')}
                    </Text>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      )}
    </div>
  )
}

export default AttachmentList