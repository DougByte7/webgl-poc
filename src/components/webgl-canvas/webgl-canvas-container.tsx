import { mat4 } from "gl-matrix"
import { FunctionComponent, useEffect, useRef } from "react"
import {
  glCreateBuffer,
  glCreateProgram,
  loadShader,
} from "@/helpers/gl-wrapper"
import { rgbTriangle } from "@/scene-objects/rgb-triangle"

const WebGLCanvasContainer: FunctionComponent = () => {
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

    let triangleRotation = 0.0
    const drawScene = (
      gl: WebGL2RenderingContext,
      info: typeof programInfo,
      deltaTime: number
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
      mat4.rotate(modelViewMatrix, modelViewMatrix, triangleRotation, [0, 0, 1])

      const sceneObjectBuffer = glCreateBuffer(gl)
      gl.bindBuffer(gl.ARRAY_BUFFER, sceneObjectBuffer)

      const sceneObjectBufferData = new Float32Array(rgbTriangle)
      gl.bufferData(gl.ARRAY_BUFFER, sceneObjectBufferData, gl.STATIC_DRAW)

      {
        const bpe = sceneObjectBufferData.BYTES_PER_ELEMENT
        const stride = 6 * bpe
        // Bind Vertex position
        gl.bindBuffer(gl.ARRAY_BUFFER, sceneObjectBuffer)
        gl.vertexAttribPointer(
          info.attribLocations.vertexPosition,
          2,
          gl.FLOAT,
          false,
          stride,
          0
        )
        gl.enableVertexAttribArray(info.attribLocations.vertexPosition)
        // Bind vertex colors
        gl.vertexAttribPointer(
          info.attribLocations.vertexColor,
          4,
          gl.FLOAT,
          false,
          stride,
          2 * bpe
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
      triangleRotation -= deltaTime
    }

    let then = 0
    const render = (now: DOMHighResTimeStamp) => {
      now *= 0.001
      const deltaTime = now - then
      then = now

      drawScene(gl, programInfo, deltaTime)

      requestAnimationFrame(render)
    }

    requestAnimationFrame(render)
  }, [])

  return <canvas ref={canvas} id="glCanvas" width="640" height="480"></canvas>
}

export default WebGLCanvasContainer
