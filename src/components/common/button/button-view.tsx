import { FunctionComponent } from "react"
import "./button.scss"

interface ButtonProps {
  className: string
  title: string
  type?: "default" | "error"
  children: React.ReactNode
  onClick: React.MouseEventHandler<HTMLButtonElement>
}

const Button: FunctionComponent<ButtonProps> = (props) => {
  const { title, children, className, type, onClick } = props

  return (
    <button
      className={`button ${type} ${className}`}
      title={title}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

Button.defaultProps = {
  type: "default",
}

export default Button
