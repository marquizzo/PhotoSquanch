precision highp float;
precision highp int;

uniform float brushSize;
uniform float timeDelta;
uniform vec2 mouseStart;
uniform vec2 mouseNow;
uniform sampler2D heightmap;

#define MASS 0.1
#define DAMPING 0.5
#define SPRING_CONSTANT 3.0

// Normalizes a float. Range: [min, max] -> [0, 1]
float normFloat(float n, float minVal, float maxVal){
    return max(0.0, min(1.0, (n-minVal) / (maxVal-minVal)));
}

// To calculate normals:
// https://stackoverflow.com/questions/6656358/calculating-normals-in-a-triangle-mesh/6661242#6661242

// Calculates mouse drag influence
vec3 mouseInfluence(vec2 uv, vec2 posStart, vec2 posNow) {
    // Convert uv & mouse into cells
    vec2 uvCell = gl_FragCoord.xy;
    vec2 posStartCell = vec2(posStart.x, 1.0 - posStart.y) * RESOLUTION;
    vec2 posNowCell = vec2(posNow.x, 1.0 - posNow.y) * RESOLUTION;

    // Get dist between start and this cells
    float distFromStart = length(uvCell - posStartCell);

    // Clamp distance influence by brushSize from [0, 1]
    float influence = normFloat(distFromStart, brushSize, 0.0);

    // Apply smooth falloff
    influence = smoothstep(0.0, 1.0, influence) * 0.9 + 0.1;

    // Move by distance between start and now cells
    vec2 distPulled = posNowCell - posStartCell;
    distPulled *= influence;
    distPulled /= RESOLUTION / vec2(3.0, 4.0);

    return vec3(distPulled.xy, distFromStart / RESOLUTION.y);
}

vec4 hookesLaw(vec2 springAnchor, vec2 springPos, vec2 springVel, float springyness) {
    vec2 springForce = -(SPRING_CONSTANT * springyness) * (springPos - springAnchor);
    vec2 dampingForce = DAMPING * springVel;
    vec2 force = springForce - dampingForce;
    vec2 accel = force / MASS;
    springVel += accel * timeDelta;
    springPos += springVel * timeDelta;

    return vec4(springPos.x, springPos.y, springVel.x, springVel.y);
}

void main() {

    vec2 cellSize = 1.0 / RESOLUTION.xy;

    vec2 uv = gl_FragCoord.xy * cellSize;

    // heightmapValue.x == xPos
    // heightmapValue.y == yPos
    // heightmapValue.z == xVel
    // heightmapValue.w == yVel
    vec4 heightmapValue = texture2D(heightmap, uv);

    vec3 mouseInf = mouseInfluence(uv, mouseStart, mouseNow);
    float springyness = (1.0 - normFloat(mouseInf.z, 0.0, 1.3)) * 4.0;
    vec4 spring = hookesLaw(mouseInf.xy, heightmapValue.xy, heightmapValue.zw, springyness);

    // gl_FragColor = vec4(springyness, springyness, springyness, 1.0);
    gl_FragColor = vec4(spring);
}
