import { Button as AntButton, ButtonProps as AntButtonProps } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

export interface ButtonProps extends AntButtonProps {
  loading?: boolean
  icon?: React.ReactNode
}

const Button = ({ loading, icon, children, ...props }: ButtonProps) => {
  return (
    <AntButton
      icon={loading ? <LoadingOutlined /> : icon}
      disabled={loading || props.disabled}
      {...props}
    >
      {children}
    </AntButton>
  )
}

export default Button