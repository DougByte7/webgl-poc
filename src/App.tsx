import { mat4 } from "gl-matrix"
import { useEffect, useRef } from "react"
import "./App.css"
import {
  glCreateBuffer,
  glCreateProgram,
  glCreateShader,
} from "./helpers/gl-wrapper"

type MyBuffers = {
  positionAndColors: WebGLBuffer
  positionAndColorsBytesPerElement: number
}

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

    const defaultClearColor: [number, number, number, number] = [
      0.8,
      0.8,
      0.8,
      1.0,
    ]
    gl.clearColor(...defaultClearColor)
    gl.clear(gl.COLOR_BUFFER_BIT)

    const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying lowp vec4 vColor;

    void main() {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vColor = aVertexColor;
    }
  `
    const fsSource = `
    varying lowp vec4 vColor;

    void main() {
      gl_FragColor = vColor;
    }
  `

    const loadShader = (
      gl: WebGL2RenderingContext,
      type: number,
      source: string
    ) => {
      const shader = glCreateShader(gl, type)

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

      const shaderProgram = glCreateProgram(gl)

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
        vertexColor: gl.getAttribLocation(shaderProgram, "aVertexColor"),
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

    const initBuffers = (gl: WebGL2RenderingContext): MyBuffers => {
      const positionAndColorsBuffer = glCreateBuffer(gl)
      gl.bindBuffer(gl.ARRAY_BUFFER, positionAndColorsBuffer)

      const positionsAndColors = [
        // v0
        0.0,
        1.0,
        // Red
        1.0,
        0.0,
        0.0,
        1.0,
        // v1
        1.0,
        -1.0,
        // Green
        0.0,
        1.0,
        0.0,
        1.0,
        // v2
        -1.0,
        -1.0,
        // Blue
        0.0,
        0.0,
        1.0,
        1.0,
      ]

      const data = new Float32Array(positionsAndColors)

      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)

      const positionAndColorsBytesPerElement = data.BYTES_PER_ELEMENT

      return {
        positionAndColors: positionAndColorsBuffer,
        positionAndColorsBytesPerElement,
      }
    }

    const drawScene = (
      gl: WebGL2RenderingContext,
      info: typeof programInfo,
      buffers: MyBuffers
    ) => {
      gl.clearColor(...defaultClearColor)
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

      {
        const stride = 6 * buffers.positionAndColorsBytesPerElement

        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.positionAndColors)
        gl.vertexAttribPointer(
          info.attribLocations.vertexPosition,
          2,
          gl.FLOAT,
          false,
          stride,
          0
        )
        gl.enableVertexAttribArray(info.attribLocations.vertexPosition)
        
        gl.vertexAttribPointer(
          info.attribLocations.vertexColor,
          4,
          gl.FLOAT,
          false,
          stride,
          2 * buffers.positionAndColorsBytesPerElement
        )
        gl.enableVertexAttribArray(info.attribLocations.vertexColor)
      }

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

      const offset = 0
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
