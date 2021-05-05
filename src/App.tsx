import { mat4 } from "gl-matrix"
import { useEffect, useRef } from "react"
import "./App.css"

function App() {
  const canvas = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    if (!canvas.current) return

    const gl = canvas.current?.getContext("webgl2")
    if (!gl) {
      throw new Error(
        "Unable to initialize WebGL. Your browser or machine may not support it."
      )
    }

    gl.clearColor(0.2, 0.2, 0.7, 1)
    gl.clear(gl.COLOR_BUFFER_BIT)

    const vsSource = `
    attribute vec4 aVertexPosition;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    void main() {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    }
  `
    const fsSource = `
    void main() {
      gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    }
  `

    const loadShader = (
      gl: WebGL2RenderingContext,
      type: number,
      source: string
    ) => {
      const shader = gl.createShader(type)
      if (!shader) {
        throw new Error("Failed to create shader.")
      }

      gl.shaderSource(shader, source)
      gl.compileShader(shader)

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        try {
          throw new Error(
            `An error occurred compiling the shaders: ${gl.getShaderInfoLog(
              shader
            )}`
          )
        } catch (e) {
          gl.deleteShader(shader)
          throw new Error(e)
        }
      }

      return shader
    }

    const initShaderProgram = (
      gl: WebGL2RenderingContext,
      vsSource: string,
      fsSource: string
    ) => {
      const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource)
      const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource)

      const shaderProgram = gl.createProgram()
      if (!shaderProgram) {
        throw new Error("Failed to create program.")
      }

      gl.attachShader(shaderProgram, vertexShader)
      gl.attachShader(shaderProgram, fragmentShader)
      gl.linkProgram(shaderProgram)

      if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        throw new Error(
          `Unable to initialize the shader program: ${gl.getProgramInfoLog(
            shaderProgram
          )}`
        )
      }

      return shaderProgram
    }

    const shaderProgram = initShaderProgram(gl, vsSource, fsSource)

    const programInfo = {
      program: shaderProgram,
      attribLocations: {
        vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
      },
      uniformLocations: {
        projectionMatrix: gl.getUniformLocation(
          shaderProgram,
          "uProjectionMatrix"
        ),
        modelViewMatrix: gl.getUniformLocation(
          shaderProgram,
          "uModelViewMatrix"
        ),
      },
    }

    const initBuffers = (gl: WebGL2RenderingContext) => {
      const positionBuffer = gl.createBuffer()
      if (!positionBuffer) {
        throw new Error("Failed to create buffer")
      }

      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

      const positions = [0.0, 1.0, 1.0, -1.0, -1.0, -1.0]

      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(positions),
        gl.STATIC_DRAW
      )

      return { position: positionBuffer }
    }

    const drawScene = (
      gl: WebGL2RenderingContext,
      info: typeof programInfo,
      buffers: { position: WebGLBuffer }
    ) => {
      gl.clearColor(0.2, 0.2, 0.7, 1)
      gl.clearDepth(1.0)
      gl.enable(gl.DEPTH_TEST)
      gl.depthFunc(gl.LEQUAL)
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

      const fieldOfView = (45 * Math.PI) / 180
      const aspect =
        (gl.canvas as HTMLCanvasElement).clientWidth /
        (gl.canvas as HTMLCanvasElement).clientHeight

      const zNear = 0.1
      const zFar = 100.0
      const projectionMatrix = mat4.create()

      mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar)

      const modelViewMatrix = mat4.create()
      mat4.translate(modelViewMatrix, modelViewMatrix, [0.0, 0.0, -6.0])

      const numComponents = 2
      const type = gl.FLOAT
      const normalize = false
      const stride = 0
      const offset = 0

      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position)
      gl.vertexAttribPointer(
        info.attribLocations.vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset
      )
      gl.enableVertexAttribArray(info.attribLocations.vertexPosition)

      gl.useProgram(info.program)

      gl.uniformMatrix4fv(
        info.uniformLocations.projectionMatrix,
        false,
        projectionMatrix
      )
      gl.uniformMatrix4fv(
        info.uniformLocations.modelViewMatrix,
        false,
        modelViewMatrix
      )

      const vertexCount = 3
      gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount)
    }

    drawScene(gl, programInfo, initBuffers(gl))
  }, [])

  return (
    <div className="App">
      <canvas ref={canvas} id="glCanvas" width="640" height="480"></canvas>
    </div>
  )
}

export default App
