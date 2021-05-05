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
