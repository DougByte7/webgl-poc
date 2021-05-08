attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aVertexNormal;

uniform mat4 uProjectionMatrix;
uniform mat4 uModelViewMatrix;
uniform mat4 uNormalMatrix;

varying vec3 normalInterp;
varying vec3 vertPos;
varying highp vec2 vTextureCoord;

void main(){
    gl_Position=uProjectionMatrix*uModelViewMatrix*vec4(aVertexPosition,1.);
    vec4 vertPos4=uModelViewMatrix*vec4(aVertexPosition,1.);
    vertPos=vec3(vertPos4)/vertPos4.w;
    normalInterp=vec3(uNormalMatrix*vec4(aVertexNormal,0.));
    vTextureCoord=aTextureCoord;
}
