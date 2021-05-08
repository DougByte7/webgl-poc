import { mat4 } from "gl-matrix"
import { FunctionComponent, useEffect, useRef } from "react"
import {
  glCreateBuffer,
  glCreateProgram,
  loadShader,
  loadTexture,
} from "@/helpers/gl-wrapper"
import {
  //cubeFaceColors,
  cubeIndices,
  cubePositions,
  cubeTextureCoordinates,
  cubeVertexNormals,
} from "@/scene-objects/cube"
import uvTextureReference from "@/textures/uv-reference.png"
const vsBlinnPhong = require("@/shaders/blinn-phong.vert").default
const fsBlinnPhong = require("@/shaders/blinn-phong.frag").default

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

    /*const vsSource = `
    attribute vec4 aVertexPosition;
    // attribute vec4 aVertexColor;
    attribute vec2 aTextureCoord;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    // varying lowp vec4 vColor;
    varying highp vec2 vTextureCoord;

    void main() {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      // vColor = aVertexColor;
      vTextureCoord = aTextureCoord;
    }
  `

    
    const fsSource = `
    // varying lowp vec4 vColor;
    varying highp vec2 vTextureCoord;

    uniform sampler2D uSampler;

    void main() {
      // gl_FragColor = vColor;
      gl_FragColor = texture2D(uSampler, vTextureCoord);
    }
  `
  */

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

    const shaderProgram = initShaderProgram(gl, vsBlinnPhong, fsBlinnPhong)

    const programInfo = {
      program: shaderProgram,
      attribLocations: {
        vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
        vertexColor: gl.getAttribLocation(shaderProgram, "aVertexColor"),
        textureCoord: gl.getAttribLocation(shaderProgram, "aTextureCoord"),
        vertexNormal: gl.getAttribLocation(shaderProgram, "aVertexNormal"),
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
        normalMatrix: gl.getUniformLocation(shaderProgram, "uNormalMatrix"),
        uSampler: gl.getUniformLocation(shaderProgram, "uSampler"),
      },
    }

    let cubeRotation = 0.0
    const texture = loadTexture(gl, uvTextureReference)

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
      mat4.rotate(modelViewMatrix, modelViewMatrix, cubeRotation, [0, 0, 1])
      mat4.rotate(modelViewMatrix, modelViewMatrix, cubeRotation * 0.2, [
        0,
        1,
        0,
      ])
      mat4.rotate(modelViewMatrix, modelViewMatrix, cubeRotation * 0.5, [
        1,
        0,
        0,
      ])

      const normalMatrix = mat4.create()
      mat4.invert(normalMatrix, modelViewMatrix)
      mat4.transpose(normalMatrix, normalMatrix)

      const sceneObjectPositionBuffer = glCreateBuffer(gl)
      gl.bindBuffer(gl.ARRAY_BUFFER, sceneObjectPositionBuffer)
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(cubePositions),
        gl.STATIC_DRAW
      )
      gl.bindBuffer(gl.ARRAY_BUFFER, sceneObjectPositionBuffer)
      gl.vertexAttribPointer(
        info.attribLocations.vertexPosition,
        3,
        gl.FLOAT,
        false,
        0,
        0
      )
      gl.enableVertexAttribArray(info.attribLocations.vertexPosition)

      /*
      let colors = cubeFaceColors
        .map<number[][]>(
          // Repeat each color four times for the four vertices of the face
          (color) => Array.from({ length: 4 }, (_) => color)
        )
        .flat(2)

      const sceneObjectColorBuffer = glCreateBuffer(gl)
      gl.bindBuffer(gl.ARRAY_BUFFER, sceneObjectColorBuffer)

      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW)
      gl.vertexAttribPointer(
        info.attribLocations.vertexColor,
        4,
        gl.FLOAT,
        false,
        0,
        0
      )
      gl.enableVertexAttribArray(info.attribLocations.vertexColor)
      */

      const sceneObjectTextureCoordBuffer = glCreateBuffer(gl)
      gl.bindBuffer(gl.ARRAY_BUFFER, sceneObjectTextureCoordBuffer)
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(cubeTextureCoordinates),
        gl.STATIC_DRAW
      )
      gl.bindBuffer(gl.ARRAY_BUFFER, sceneObjectTextureCoordBuffer)
      gl.vertexAttribPointer(
        info.attribLocations.textureCoord,
        2,
        gl.FLOAT,
        false,
        0,
        0
      )
      gl.enableVertexAttribArray(info.attribLocations.textureCoord)

      const sceneObjectIndicesBuffer = glCreateBuffer(gl)
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sceneObjectIndicesBuffer)
      gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(cubeIndices),
        gl.STATIC_DRAW
      )

      const sceneObjectNormalBuffer = glCreateBuffer(gl)
      gl.bindBuffer(gl.ARRAY_BUFFER, sceneObjectNormalBuffer)
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
      gl.uniformMatrix4fv(
        info.uniformLocations.normalMatrix,
        false,
        normalMatrix
      )

      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.uniform1i(programInfo.uniformLocations.uSampler, 0)

      const offset = 0
      const vertexCount = 36
      gl.drawElements(gl.TRIANGLES, vertexCount, gl.UNSIGNED_SHORT, offset)
      cubeRotation -= deltaTime
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
