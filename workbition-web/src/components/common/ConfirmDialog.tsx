import { Modal } from 'antd'
import { ExclamationCircleOutlined } from '@ant-design/icons'

interface ConfirmDialogProps {
  open: boolean
  title: string
  content: string
  okText?: string
  cancelText?: string
  okType?: 'primary' | 'danger'
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}

const ConfirmDialog = ({
  open,
  title,
  content,
  okText = '确认',
  cancelText = '取消',
  okType = 'primary',
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmDialogProps) => {
  return (
    <Modal
      open={open}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ExclamationCircleOutlined
            style={{
              color: okType === 'danger' ? '#ff4d4f' : '#faad14',
              fontSize: 22,
            }}
          />
          <span>{title}</span>
        </div>
      }
      onOk={onConfirm}
      onCancel={onCancel}
      okText={okText}
      cancelText={cancelText}
      okButtonProps={{
        danger: okType === 'danger',
        loading,
      }}
      centered
    >
      <p>{content}</p>
    </Modal>
  )
}

export default ConfirmDialog