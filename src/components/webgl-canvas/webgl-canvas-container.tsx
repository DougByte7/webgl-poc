import { mat4 } from "gl-matrix"
import { FunctionComponent, useEffect, useRef, useState } from "react"
import {
  getWebGL2RenderingContext,
  glCreateBuffer,
  initShaderProgram,
  loadTexture,
} from "@/helpers/gl-wrapper"
import {
  cubeIndices,
  cubePositions,
  cubeTextureCoordinates,
  cubeVertexNormals,
} from "@/scene-objects/cube"
import uvTextureReference from "@/textures/uv-reference.png"
import { useWindowSize } from "@/helpers/hooks/use-resize"
const vsBlinnPhong = require("@/shaders/blinn-phong.vert").default
const fsBlinnPhong = require("@/shaders/blinn-phong.frag").default

interface WebGLCanvasContainerProps {
  isPlaying: boolean
  scale: number
  rotationX: number
  rotationY: number
  rotationZ: number
}

const WebGLCanvasContainer: FunctionComponent<WebGLCanvasContainerProps> = (
  props
) => {
  const { isPlaying, scale, rotationX, rotationY, rotationZ } = props
  const canvas = useRef<HTMLCanvasElement>(null)
  const [gl, setGL] = useState<WebGL2RenderingContext>()
  const cubeRotation = useRef(0.0)
  const requestRef = useRef<number>()
  const then = useRef<DOMHighResTimeStamp>(0)

  // Probably there's a better way to prevent rebinding buffers on rerenders...
  const shaderProgram = useRef<WebGLProgram>()
  const texture = useRef<WebGLTexture>()
  const sceneObjectPositionBuffer = useRef<WebGLBuffer>()
  const sceneObjectTextureCoordBuffer = useRef<WebGLBuffer>()
  const sceneObjectIndicesBuffer = useRef<WebGLBuffer>()
  const sceneObjectNormalBuffer = useRef<WebGLBuffer>()
  const modelViewMatrix = useRef<mat4>()

  const setRenderingContext = () => {
    if (!canvas.current) return

    const renderingContext = getWebGL2RenderingContext(canvas.current)

    setGL(renderingContext)
  }

  const [width, height] = useWindowSize()

  useEffect(setRenderingContext, [canvas])

  useEffect(() => {
    if (!gl) return

    const defaultClearColor: [number, number, number, number] = [
      0.26,
      0.26,
      0.29,
      1.0,
    ]
    gl.clearColor(...defaultClearColor)
    gl.clear(gl.COLOR_BUFFER_BIT)

    if (!shaderProgram.current)
      shaderProgram.current = initShaderProgram(gl, vsBlinnPhong, fsBlinnPhong)

    const programInfo = {
      program: shaderProgram.current,
      attribLocations: {
        vertexPosition: gl.getAttribLocation(
          shaderProgram.current,
          "aVertexPosition"
        ),
        vertexColor: gl.getAttribLocation(
          shaderProgram.current,
          "aVertexColor"
        ),
        textureCoord: gl.getAttribLocation(
          shaderProgram.current,
          "aTextureCoord"
        ),
        vertexNormal: gl.getAttribLocation(
          shaderProgram.current,
          "aVertexNormal"
        ),
      },
      uniformLocations: {
        projectionMatrix: gl.getUniformLocation(
          shaderProgram.current,
          "uProjectionMatrix"
        ),
        modelViewMatrix: gl.getUniformLocation(
          shaderProgram.current,
          "uModelViewMatrix"
        ),
        normalMatrix: gl.getUniformLocation(
          shaderProgram.current,
          "uNormalMatrix"
        ),
        uSampler: gl.getUniformLocation(shaderProgram.current, "uSampler"),
      },
    }

    if (!texture.current) texture.current = loadTexture(gl, uvTextureReference)

    const drawScene = (
      gl: WebGL2RenderingContext,
      info: typeof programInfo,
      deltaTime: number
    ) => {
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
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

      modelViewMatrix.current = mat4.create()
      mat4.translate(modelViewMatrix.current, modelViewMatrix.current, [
        0.0,
        0.0,
        -6.0,
      ])
      mat4.scale(modelViewMatrix.current, modelViewMatrix.current, [
        scale,
        scale,
        scale,
      ])

      mat4.rotate(
        modelViewMatrix.current,
        modelViewMatrix.current,
        isPlaying ? cubeRotation.current * 0.5 : rotationX,
        [1, 0, 0]
      )
      mat4.rotate(
        modelViewMatrix.current,
        modelViewMatrix.current,
        isPlaying ? cubeRotation.current * 0.2 : rotationY,
        [0, 1, 0]
      )
      mat4.rotate(
        modelViewMatrix.current,
        modelViewMatrix.current,
        isPlaying ? cubeRotation.current : rotationZ,
        [0, 0, 1]
      )

      const normalMatrix = mat4.create()
      mat4.invert(normalMatrix, modelViewMatrix.current)
      mat4.transpose(normalMatrix, normalMatrix)

      if (!sceneObjectPositionBuffer.current) {
        sceneObjectPositionBuffer.current = glCreateBuffer(gl)
        gl.bindBuffer(gl.ARRAY_BUFFER, sceneObjectPositionBuffer.current)
        gl.bufferData(
          gl.ARRAY_BUFFER,
          new Float32Array(cubePositions),
          gl.STATIC_DRAW
        )
        gl.bindBuffer(gl.ARRAY_BUFFER, sceneObjectPositionBuffer.current)
        gl.vertexAttribPointer(
          info.attribLocations.vertexPosition,
          3,
          gl.FLOAT,
          false,
          0,
          0
        )
        gl.enableVertexAttribArray(info.attribLocations.vertexPosition)
      }

      if (!sceneObjectTextureCoordBuffer.current) {
        sceneObjectTextureCoordBuffer.current = glCreateBuffer(gl)
        gl.bindBuffer(gl.ARRAY_BUFFER, sceneObjectTextureCoordBuffer.current)
        gl.bufferData(
          gl.ARRAY_BUFFER,
          new Float32Array(cubeTextureCoordinates),
          gl.STATIC_DRAW
        )
        gl.bindBuffer(gl.ARRAY_BUFFER, sceneObjectTextureCoordBuffer.current)
        gl.vertexAttribPointer(
          info.attribLocations.textureCoord,
          2,
          gl.FLOAT,
          false,
          0,
          0
        )
        gl.enableVertexAttribArray(info.attribLocations.textureCoord)
      }
      if (!sceneObjectIndicesBuffer.current) {
        sceneObjectIndicesBuffer.current = glCreateBuffer(gl)
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sceneObjectIndicesBuffer.current)
        gl.bufferData(
          gl.ELEMENT_ARRAY_BUFFER,
          new Uint16Array(cubeIndices),
          gl.STATIC_DRAW
        )
      }
      if (!sceneObjectNormalBuffer.current) {
        sceneObjectNormalBuffer.current = glCreateBuffer(gl)
        gl.bindBuffer(gl.ARRAY_BUFFER, sceneObjectNormalBuffer.current)
        gl.bufferData(
          gl.ARRAY_BUFFER,
          new Float32Array(cubeVertexNormals),
          gl.STATIC_DRAW
        )
        gl.vertexAttribPointer(
          info.attribLocations.vertexNormal,
          3,
          gl.FLOAT,
          false,
          0,
          0
        )
        gl.enableVertexAttribArray(info.attribLocations.vertexNormal)
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
        modelViewMatrix.current
      )
      gl.uniformMatrix4fv(
        info.uniformLocations.normalMatrix,
        false,
        normalMatrix
      )

      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, texture.current!)
      gl.uniform1i(programInfo.uniformLocations.uSampler, 0)

      const offset = 0
      const vertexCount = 36
      gl.drawElements(gl.TRIANGLES, vertexCount, gl.UNSIGNED_SHORT, offset)
      cubeRotation.current -= deltaTime * ((isPlaying as unknown) as number)
    }

    const render = (now: DOMHighResTimeStamp) => {
      now *= 0.001
      const deltaTime = now - then.current
      then.current = now

      drawScene(gl, programInfo, deltaTime)

      requestRef.current = requestAnimationFrame(render)
    }

    requestAnimationFrame(render)
    return () => {
      cancelAnimationFrame(requestRef.current!)
    }
  }, [gl, isPlaying, scale, rotationX, rotationY, rotationZ])

  return (
    <canvas ref={canvas} id="glCanvas" width={width} height={height}></canvas>
  )
}

export default WebGLCanvasContainer
