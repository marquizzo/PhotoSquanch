precision highp float;
precision highp int;
#define PI 3.14159265

uniform vec2 mousePos;
uniform float mouseSize;
uniform float viscosityConstant;
uniform sampler2D heightmap;

#define DELTA_TIME ( 1.0 / 20.0 )
#define GRAVITY_CONSTANT ( RESOLUTION.x * DELTA_TIME * 1.0 )

// Normalizes a float. Range: [min, max] -> [0, 1]
float normFloat(float n, float minVal, float maxVal){
    return max(0.0, min(1.0, (n-minVal) / (maxVal-minVal)));
}

float mouseInfluence(vec2 uv, vec2 mousePos) {
    // Convert uv & mouse into cells
    vec2 uvCell = uv * RESOLUTION;
    vec2 mouseCell = vec2( mousePos.x, 1.0 - mousePos.y ) * RESOLUTION;

    // Get dist of mouseCell
    float mouseDist = length(uvCell - mouseCell);

    // Apply proportional falloff clamped at mouseSize
    mouseDist = smoothstep(mouseSize, 0.0, mouseDist);

    return mouseDist;
}

void main() {

    vec2 cellSize = 1.0 / RESOLUTION.xy;

    vec2 uv = gl_FragCoord.xy * cellSize;

    // heightmapValue.x == height
    // heightmapValue.y == velocity
    vec4 heightmapValue = texture2D( heightmap, uv );

    // Get neighbours
    vec4 north = texture2D( heightmap, vec2( uv.x, uv.y + cellSize.y ) );
    vec4 south = texture2D( heightmap, vec2( uv.x, uv.y - cellSize.y ) );
    vec4 east = texture2D( heightmap, vec2( uv.x + cellSize.x, uv.y ) );
    vec4 west = texture2D( heightmap, vec2( uv.x - cellSize.x, uv.y ) );

    float sump = north.x + south.x + east.x + west.x - 4.0 * heightmapValue.x;

    float accel = sump * GRAVITY_CONSTANT;
    // float accel = 0.0;

    // Dynamics
    heightmapValue.y += accel;
    heightmapValue.x += heightmapValue.y * DELTA_TIME;

    // Viscosity
    heightmapValue.x += sump * viscosityConstant;

    float mouseInf = mouseInfluence(uv, mousePos);
    heightmapValue.x += mouseInf;
    heightmapValue.x = clamp(heightmapValue.x, -1.0, 1.0);

    // Bring X back to 0 over time to prevent endless growth
    heightmapValue.x *= 0.95;

    gl_FragColor = heightmapValue;
}
