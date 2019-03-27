precision highp float;
#define PI 3.14159265

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform vec3 cameraPosition;
uniform sampler2D heightmap;
uniform float transition;

attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;

varying vec2 vUV;
varying vec3 viewPos;
varying float vMix;

// Normalizes a float. Range: [min, max] -> [0, 1]
float normFloat(float n, float minVal, float maxVal){
    return max(0.0, min(1.0, (n-minVal) / (maxVal-minVal)));
}

void main() {
    // Apply transforms
    vec4 heightmap = texture2D(heightmap, uv);
    float height = (abs(heightmap.r) + abs(heightmap.g)) / 2.0;

    vec3 pos = position + vec3(heightmap.rg, height);

    vec4 realPos = modelMatrix * vec4(pos, 1.0);

    // Varyings
    viewPos = realPos.xyz;
    vUV = uv;
    vMix = normFloat(transition, 0.0, 1.0);

    gl_Position = projectionMatrix * viewMatrix * realPos;
}

//////////////////////////////////////////////////////////////////////////

/* uniform vec4 uTouches[10]; // first 3 components indicate position, 4th if active or not.
uniform vec4 uDragstart[10]; // last indicate forcetouch
uniform float uScale;

float normalize(float x, float istart, float istop, float ostart, float ostop) {
  return ostart + (ostop - ostart) * ((x - istart) / (istop - istart));
}

#define PHYSICAL
varying vec3 vViewPosition;
#ifndef FLAT_SHADED
    varying vec3 vNormal;
#endif
#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
    #include <uv_vertex>
    #include <uv2_vertex>
    #include <color_vertex>
    #include <beginnormal_vertex>
    #include <morphnormal_vertex>
    #include <skinbase_vertex>
    #include <skinnormal_vertex>
    #include <defaultnormal_vertex>
#ifndef FLAT_SHADED
    vNormal = normalize( transformedNormal );
#endif

    #include <begin_vertex>
    #include <displacementmap_vertex>

  vec3 original = transformed;

  for (int i = 0; i < 10; i++) {

    float force = uDragstart[i].w * 1.5;
    vec3 touch = uTouches[i].xyz / uScale;
         touch.z = 3.0 * force;

    vec3 dragStart = uDragstart[i].xyz / uScale;
    float active = uTouches[i].w;

    float dist = distance(touch, transformed);
    vec3 displacement = (touch - dragStart);

    float distFromDrag = distance(transformed, dragStart);
    float influence = normalize(distFromDrag, 0.0, 10.0, 1.0, 0.0);
          influence = clamp(influence, 0.0, 1.0);

    float multiplier = pow(influence, 3.0);
    vec3 movement = (displacement * multiplier) * active;

    transformed += movement * normalize(movement.z, 0.0, 3.0, 1.0, 0.95);
  }

    #include <morphtarget_vertex>
    #include <skinning_vertex>
    #include <project_vertex>
    #include <logdepthbuf_vertex>
    #include <clipping_planes_vertex>
    vViewPosition = - mvPosition.xyz;
    #include <worldpos_vertex>
    #include <shadowmap_vertex>
    #include <fog_vertex>
} */
