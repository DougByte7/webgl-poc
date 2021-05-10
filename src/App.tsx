import "./App.scss"
import { WebGLCanvasComponent } from "./components/webgl-canvas"
import { useState } from "react"
import { TransformActionsMenuComponent } from "./components/transform-actions-menu"

function App() {
  // TODO: Create a context
  const [isPlaying, setIsPlaying] = useState(true)
  const [scale, setScale] = useState(1)
  const [rotationX, setRotationX] = useState(0)
  const [rotationY, setRotationY] = useState(0)
  const [rotationZ, setRotationZ] = useState(0)
  const [error, setError] = useState(false)

  return (
    <div className="App">
      <WebGLCanvasComponent
        isPlaying={isPlaying}
        scale={scale}
        rotationX={rotationX}
        rotationY={rotationY}
        rotationZ={rotationZ}
      />
      <TransformActionsMenuComponent
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        scale={scale}
        setScale={setScale}
        rotationX={rotationX}
        setRotationX={setRotationX}
        rotationY={rotationY}
        setRotationY={setRotationY}
        rotationZ={rotationZ}
        setRotationZ={setRotationZ}
        error={error}
        setError={setError}
      />
    </div>
  )
}

export default App
