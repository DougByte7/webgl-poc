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
) => {
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
