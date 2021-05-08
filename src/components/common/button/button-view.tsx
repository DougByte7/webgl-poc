import { FunctionComponent } from "react"
import './button.scss'

interface ButtonProps {
  className: string
  title: string
  children: React.ReactNode
  onClick: React.MouseEventHandler<HTMLButtonElement>
}

const Button: FunctionComponent<ButtonProps> = (props) => {
  const { title, children, className, onClick } = props

  return (
    <button className={`button ${className}`} title={title} onClick={onClick}>
      {children}
    </button>
  )
}

export default Button
