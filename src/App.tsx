import "./App.scss"
import { WebGLCanvasComponent } from "./components/webgl-canvas"
import { ErrorBoundaryComponent } from "./components/error-boundary"
function App() {
  return (
    <div className="App">
      <ErrorBoundaryComponent>
        <WebGLCanvasComponent />
      </ErrorBoundaryComponent>
    </div>
  )
}

export default App
