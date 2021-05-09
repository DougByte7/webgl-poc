import "./App.scss"
import { WebGLCanvasComponent } from "./components/webgl-canvas"
import { ErrorBoundaryComponent } from "./components/common/error-boundary"
import { Button } from "./components/common/button"
import { useState } from "react"
function App() {
  const [isPlaying, setIsPlaying] = useState(true)
  const buttonAction = isPlaying ? "⏸️ Pause" : "▶️ Play"

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  return (
    <div className="App">
      <ErrorBoundaryComponent>
        <WebGLCanvasComponent isPlaying={isPlaying} />
        <menu type="toolbar" className='menu'>
          <li>
            <Button
              className="btn-play-pause"
              title={buttonAction}
              onClick={handlePlayPause}
            >
              {buttonAction}
            </Button>
          </li>
        </menu>
      </ErrorBoundaryComponent>
    </div>
  )
}

export default App
