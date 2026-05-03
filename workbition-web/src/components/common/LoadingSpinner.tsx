import { Spin } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

interface LoadingSpinnerProps {
  size?: 'small' | 'default' | 'large'
  tip?: string
  fullScreen?: boolean
}

const LoadingSpinner = ({ size = 'default', tip, fullScreen = false }: LoadingSpinnerProps) => {
  const antIcon = <LoadingOutlined style={{ fontSize: size === 'large' ? 40 : 24 }} spin />

  if (fullScreen) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          zIndex: 9999,
        }}
      >
        <Spin indicator={antIcon} tip={tip} size={size}>
          <div style={{ padding: 50 }} />
        </Spin>
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 50,
      }}
    >
      <Spin indicator={antIcon} tip={tip} size={size}>
        <div style={{ padding: 50 }} />
      </Spin>
    </div>
  )
}

export default LoadingSpinner