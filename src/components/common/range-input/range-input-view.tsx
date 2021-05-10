import { FunctionComponent } from "react"
import "./range-input.scss"

interface RangeInputProps {
  label: string
  name: string
  id: string
  value: number
  min: number
  max: number
  step?: number
  disabled?: boolean
  className?: string
  onChange: React.ChangeEventHandler<HTMLInputElement>
}

const RangeInput: FunctionComponent<RangeInputProps> = (props) => {
  const { label, className, ...rest } = props
  return (
    <label className={`range-input-label ${className}`} htmlFor={rest.id}>
      {label}
      <input className="range-input" type="range" {...rest} />
      {rest.value}
    </label>
  )
}

RangeInput.defaultProps = {
  className: "",
  disabled: false,
}

export default RangeInput
