precision highp float;
precision highp int;

uniform float brushSize;
uniform float falloffMode;
uniform vec2 mouseStart;
uniform vec2 mouseNow;
uniform sampler2D heightmap;

// Spring attributes
uniform float sMass;
uniform float sTension;
uniform float sDamping;

#define TIME_DELTA 0.03
#define IMG_RATIO vec2(3.0, 4.0)

// Normalizes a float. Range: [min, max] -> [0, 1]
float normFloat(float n, float minVal, float maxVal){
    return max(0.0, min(1.0, (n-minVal) / (maxVal-minVal)));
}

vec3 mouseInfluence(vec2 uv, vec2 posStart, vec2 posNow) {
    // Convert uv & mouse into cells
    vec2 uvCell = gl_FragCoord.xy;
    vec2 anchorCell = vec2(posStart.x, 1.0 - posStart.y) * RESOLUTION;
    vec2 currentCell = vec2(posNow.x, 1.0 - posNow.y) * RESOLUTION;

    // Get dist between start and this cells
    float distFromStart = length(uvCell - anchorCell);

    // Clamp distance influence by brushSize from [0, 1]
    float influence = normFloat(distFromStart, brushSize, 0.0);

    // Change influence by falloff mode
    if (falloffMode < 0.5) {
        // Smooth
        influence = smoothstep(0.0, 1.0, influence);
    } else if(falloffMode < 1.5) {
        // Linear
        influence = normFloat(influence, 0.0, 1.0);
    } else if (falloffMode < 2.5) {
        // Circle
        influence = sqrt(influence);
    } else if (falloffMode < 3.5) {
        // Peak
        influence = influence * influence;        
    }

    // slight influence to remaining cells
    influence = (influence * 0.9 + 0.1) * 2.0;

    // Move by distance between start and now cells
    vec2 distPulled = currentCell - anchorCell;
    distPulled *= influence;
    distPulled /= RESOLUTION / IMG_RATIO;

    return vec3(distPulled.xy, distFromStart / RESOLUTION.y);
}

vec4 hookesLaw(vec2 springAnchor, vec2 springPos, vec2 springVel, float springyness) {
    vec2 displ = springPos - springAnchor;
    vec2 tensionF = -sTension * springyness * displ;
    vec2 dampingF = sDamping * springVel;
    vec2 finalF = tensionF - dampingF;
    vec2 accel = finalF / sMass;
    springVel += accel * TIME_DELTA;
    springPos += springVel;

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
