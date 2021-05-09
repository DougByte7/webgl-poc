export function getWebGL2RenderingContext(
  canvas: HTMLCanvasElement
): WebGL2RenderingContext {
  const renderingContext = canvas.getContext("webgl2")
  if (!renderingContext) {
    throw new Error(
      "Unable to initialize WebGL. Your browser or machine may not support it."
    )
  }

  return renderingContext
}
export function glCreateBuffer(gl: WebGL2RenderingContext): WebGLBuffer {
  const webGLBuffer = gl.createBuffer()
  if (!webGLBuffer) {
    throw new Error("Failed to create buffer")
  }
  return webGLBuffer
}

export function glCreateShader(
  gl: WebGL2RenderingContext,
  type: number
): WebGLShader {
  const shader = gl.createShader(type)
  if (!shader) {
    throw new Error("Failed to create shader.")
  }
  return shader
}

export function glCreateProgram(gl: WebGL2RenderingContext): WebGLProgram {
  const program = gl.createProgram()
  if (!program) {
    throw new Error("Failed to create program.")
  }
  return program
}

export const loadShader = (
  gl: WebGL2RenderingContext,
  type: number,
  source: string
): WebGLShader => {
  const shader = glCreateShader(gl, type)

  gl.shaderSource(shader, source)
  gl.compileShader(shader)

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const shaderInfoLog = gl.getShaderInfoLog(shader)
    gl.deleteShader(shader)
    throw new Error(`An error occurred compiling the shaders: ${shaderInfoLog}`)
  }

  return shader
}

export const loadTexture = (
  gl: WebGL2RenderingContext,
  url: string
): WebGLTexture => {
  const texture = gl.createTexture()
  if (!texture) {
    throw new Error("Failed to create texture.")
  }
  gl.bindTexture(gl.TEXTURE_2D, texture)

  const level = 0
  const internalFormat = gl.RGBA
  const width = 1
  const height = 1
  const border = 0
  const srcFormat = gl.RGBA
  const srcType = gl.UNSIGNED_BYTE
  const pixel = new Uint8Array([255, 20, 147, 255])
  gl.texImage2D(
    gl.TEXTURE_2D,
    level,
    internalFormat,
    width,
    height,
    border,
    srcFormat,
    srcType,
    pixel
  )

  const isPowerOf2 = (value: number) => (value & (value - 1)) === 0
  const image = new Image()
  image.onload = () => {
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(
      gl.TEXTURE_2D,
      level,
      internalFormat,
      srcFormat,
      srcType,
      image
    )

    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
      gl.generateMipmap(gl.TEXTURE_2D)
    } else {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    }
  }
  image.src = url

  return texture
}

export const initShaderProgram = (
  gl: WebGL2RenderingContext,
  vsSource: string,
  fsSource: string
): WebGLProgram => {
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
