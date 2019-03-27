#extension GL_OES_standard_derivatives : enable
precision highp float;

#define PI 3.14159265

uniform sampler2D map0;
uniform sampler2D map1;

varying vec2 vUV;
varying vec3 viewPos;
varying float vMix;

void main() {
    // Calculate normals
    /* vec3 camPos = vec3(0, 0, 5);
    vec3 xTangent = dFdx( viewPos );
    vec3 yTangent = dFdy( viewPos );
    vec3 faceNormal = normalize( cross( xTangent, yTangent ) );
    vec3 lightVector = normalize(camPos - faceNormal);
    float flatShading = dot(faceNormal, lightVector); */
    float flatShading = 1.0;

    // Fake anti-alias
    float fauxAA = smoothstep(0.5, 0.49, abs(vUV.x - 0.5));
    fauxAA *= smoothstep(0.5, 0.495, abs(vUV.y - 0.5));

    // Texture mixing
    vec4 texture0 = texture2D(map0, vUV);
    vec4 texture1 = texture2D(map1, vUV);
    vec4 color = mix(texture0, texture1, vMix);
    gl_FragColor = vec4(color.rgb - (1.0 - flatShading) * 0.5, color.a * fauxAA);
    // gl_FragColor = vec4(0.3);
}
