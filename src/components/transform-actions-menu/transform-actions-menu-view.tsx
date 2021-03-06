import { FunctionComponent } from "react"
import { Button } from "@/components/common/button"
import { RangeInput } from "@/components/common/range-input"
import "./transform-actions-menu.scss"

interface TransformActionsMenuViewProps {
  isPlaying: boolean
  setIsPlaying: (value: boolean) => void
  scale: number
  setScale: (value: number) => void
  rotationX: number
  setRotationX: (value: number) => void
  rotationY: number
  setRotationY: (value: number) => void
  rotationZ: number
  setRotationZ: (value: number) => void
  error: boolean
  setError: (value: boolean) => void
}

const TransformActionsMenuView: FunctionComponent<TransformActionsMenuViewProps> = (
  props
) => {
  const {
    isPlaying,
    setIsPlaying,
    scale,
    setScale,
    rotationX,
    setRotationX,
    rotationY,
    setRotationY,
    rotationZ,
    setRotationZ,
    error,
    setError,
  } = props

  const buttonAction = isPlaying ? "⏸️ Pause" : "▶️ Play"

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleChangeInputValue = (
    setter: (value: number) => void
  ): React.ChangeEventHandler<HTMLInputElement> => (event) => {
    setter(parseFloat(event.currentTarget.value))
  }

  const handleThrowError = () => {
    setError(true)
  }

  if (error) {
    setError(false)
    throw new Error(
      'HTTPCode: 200; payload: { status: "error", message: "Failed with success!" }'
    )
  }

  const maxRotation = Math.PI * 2

  return (
    <menu type="toolbar" className="menu">
      <li className="menu-item">
        <RangeInput
          label="Scale (xyz)"
          name="scale-range"
          id="scale-range"
          value={scale}
          min={0.1}
          max={2}
          step={0.1}
          onChange={handleChangeInputValue(setScale)}
        />
      </li>
      {isPlaying && (
        <span className="nope">
          🚫 Can not change rotation while the animation is playing !
        </span>
      )}
      <li className="menu-item">
        <RangeInput
          label="Rotation (x)"
          name="rotation-x-range"
          id="rotation-x-range"
          value={rotationX}
          min={0}
          max={maxRotation}
          step={0.1}
          disabled={isPlaying}
          onChange={handleChangeInputValue(setRotationX)}
        />
      </li>
      <li className="menu-item">
        <RangeInput
          label="Rotation (y)"
          name="rotation-y-range"
          id="rotation-y-range"
          value={rotationY}
          min={0}
          max={maxRotation}
          step={0.1}
          disabled={isPlaying}
          onChange={handleChangeInputValue(setRotationY)}
        />
      </li>
      <li className="menu-item">
        <RangeInput
          label="Rotation (z)"
          name="rotation-z-range"
          id="rotation-z-range"
          value={rotationZ}
          min={0}
          max={maxRotation}
          step={0.1}
          disabled={isPlaying}
          onChange={handleChangeInputValue(setRotationZ)}
        />
      </li>
      <li className="menu-item play-pause">
        <Button
          className="btn-play-pause"
          title={buttonAction}
          onClick={handlePlayPause}
        >
          {buttonAction}
        </Button>
      </li>
      <li className="menu-item">
        <Button
          className="btn-error"
          title="Throw error"
          type="error"
          onClick={handleThrowError}
        >
          💥 Throw error
        </Button>
      </li>
    </menu>
  )
}

export default TransformActionsMenuView
