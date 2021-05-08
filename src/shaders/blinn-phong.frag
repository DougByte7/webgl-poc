precision mediump float;

varying vec3 normalInterp;
varying vec3 vertPos;
varying highp vec2 vTextureCoord;

uniform sampler2D uSampler;

const vec3 lightPos=vec3(1.,1.,1.);
const vec3 lightColor=vec3(1.,1.,1.);
const float lightPower=40.;
const vec3 ambientColor=vec3(.1,0.,0.);
const vec3 diffuseColor=vec3(1.0, 1.0, 1.0);
const vec3 specColor=vec3(1.,1.,1.);
const float shininess=16.;
const float screenGamma=2.2;// Assume the monitor is calibrated to the sRGB color space

void main(){
    
    vec3 normal=normalize(normalInterp);
    vec3 lightDir=lightPos-vertPos;
    float distance=length(lightDir);
    distance=distance*distance;
    lightDir=normalize(lightDir);
    
    float lambertian=max(dot(lightDir,normal),0.);
    float specular=0.;
    
    if(lambertian>0.){
        
        vec3 viewDir=normalize(-vertPos);
        
        vec3 halfDir=normalize(lightDir+viewDir);
        float specAngle=max(dot(halfDir,normal),0.);
        specular=pow(specAngle,shininess);
    }
    vec3 colorLinear=ambientColor+
    diffuseColor*lambertian*lightColor*lightPower/distance+
    specColor*specular*lightColor*lightPower/distance;
    
    vec3 colorGammaCorrected=pow(colorLinear,vec3(1./screenGamma));
    
    highp vec4 texelColor=texture2D(uSampler,vTextureCoord);
    
    gl_FragColor=vec4(texelColor.rgb*colorGammaCorrected,texelColor.a);
}
