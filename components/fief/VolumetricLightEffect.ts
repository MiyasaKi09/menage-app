import { Effect, EffectAttribute } from 'postprocessing'
import {
  Uniform,
  Vector2,
  Vector3,
  Matrix4,
  Camera,
  DirectionalLight,
  Texture,
  DataTexture,
  RedFormat,
  UnsignedByteType,
  WebGLRenderer,
  WebGLRenderTarget,
} from 'three'

// Fallback white 1x1 texture for initial frames before shadow map exists
const fallbackShadowTexture = (() => {
  const data = new Uint8Array([255])
  const tex = new DataTexture(data, 1, 1, RedFormat, UnsignedByteType)
  tex.needsUpdate = true
  return tex
})()

/**
 * Real-time volumetric light pass using ray marching through the shadow map.
 * Must be paired with a directional light whose shadow map is populated.
 */

const fragmentShader = /* glsl */ `
uniform sampler2D tShadowMap;
uniform mat4 shadowMatrix;
uniform mat4 inverseProjection;
uniform mat4 cameraMatrix;
uniform vec3 cameraPos;
uniform vec3 lightDir;        // direction TO light (from scene)
uniform vec3 lightColor;
uniform float uDensity;
uniform float uScattering;
uniform float uMaxDistance;
uniform float uPhaseG;
uniform int uNumSteps;
uniform vec2 resolution;
uniform float time;
uniform int uDebugMode;  // 0=normal, 1=worldPos, 2=shadow, 3=depth, 4=lightDir

// Interleaved gradient noise — for jitter to reduce banding
float ign(vec2 p) {
  vec3 magic = vec3(0.06711056, 0.00583715, 52.9829189);
  return fract(magic.z * fract(dot(p, magic.xy)));
}

// Reconstruct world position from UV + depth
vec3 worldPosFromDepth(vec2 uv, float depth) {
  vec4 clip = vec4(uv * 2.0 - 1.0, depth * 2.0 - 1.0, 1.0);
  vec4 view = inverseProjection * clip;
  view /= view.w;
  vec4 world = cameraMatrix * view;
  return world.xyz;
}

// Sample shadow map — returns 1.0 if lit, 0.0 if in shadow
float sampleShadow(vec3 worldPos) {
  vec4 sc = shadowMatrix * vec4(worldPos, 1.0);
  sc.xyz /= sc.w;
  sc.xyz = sc.xyz * 0.5 + 0.5;

  // Outside shadow frustum → considered lit
  if (sc.x < 0.0 || sc.x > 1.0 || sc.y < 0.0 || sc.y > 1.0 || sc.z < 0.0 || sc.z > 1.0) {
    return 1.0;
  }

  float shadowDepth = texture2D(tShadowMap, sc.xy).r;
  float bias = 0.003;
  return sc.z - bias < shadowDepth ? 1.0 : 0.0;
}

// Henyey-Greenstein phase — controls scatter direction
float phaseHG(float cosTheta, float g) {
  float g2 = g * g;
  float denom = 1.0 + g2 - 2.0 * g * cosTheta;
  return (1.0 - g2) / (4.0 * 3.14159 * pow(max(denom, 1e-4), 1.5));
}

void mainImage(const in vec4 inputColor, const in vec2 uv, const in float depth, out vec4 outputColor) {
  // World pos of the fragment the camera sees
  vec3 worldEnd = worldPosFromDepth(uv, depth);

  // ===== DEBUG MODES =====
  if (uDebugMode == 1) {
    // World position as color — should show XYZ gradient
    outputColor = vec4(fract(worldEnd * 0.3 + 0.5), 1.0);
    return;
  }
  if (uDebugMode == 3) {
    // Depth as grayscale
    outputColor = vec4(vec3(depth), 1.0);
    return;
  }
  if (uDebugMode == 4) {
    // Light direction as color
    outputColor = vec4(lightDir * 0.5 + 0.5, 1.0);
    return;
  }

  vec3 rayDir = normalize(worldEnd - cameraPos);
  float rayLen = min(length(worldEnd - cameraPos), uMaxDistance);

  int steps = uNumSteps;
  float stepSize = rayLen / float(steps);
  float jitter = ign(gl_FragCoord.xy + time * 60.0) * stepSize;

  // Phase — forward scattering makes beams visible when facing light
  float cosTheta = dot(rayDir, -normalize(lightDir));
  float phase = phaseHG(cosTheta, uPhaseG);

  vec3 scattered = vec3(0.0);
  float transmittance = 1.0;

  float shadowAvg = 0.0;
  for (int i = 0; i < 128; i++) {
    if (i >= steps) break;
    float t = float(i) * stepSize + jitter;
    if (t >= rayLen) break;

    vec3 samplePos = cameraPos + rayDir * t;

    float lit = sampleShadow(samplePos);
    shadowAvg += lit;

    // Dustier near the floor
    float heightFactor = 1.0 + 0.4 * (1.0 - smoothstep(0.0, 2.5, samplePos.y));
    float localDensity = uDensity * heightFactor;

    vec3 inScatter = lightColor * uScattering * phase * lit * localDensity;
    transmittance *= exp(-localDensity * stepSize);
    scattered += inScatter * transmittance * stepSize;
  }

  if (uDebugMode == 2) {
    // Average shadow sample — should show silhouette of shadowed vs lit regions
    shadowAvg /= float(steps);
    outputColor = vec4(vec3(shadowAvg), 1.0);
    return;
  }

  // Additive composite
  outputColor = vec4(inputColor.rgb + scattered, inputColor.a);
}
`

interface VolumetricParams {
  density?: number
  scattering?: number
  maxDistance?: number
  steps?: number
  phaseG?: number
  lightColor?: [number, number, number]
  debugMode?: 0 | 1 | 2 | 3 | 4
}

export class VolumetricLightEffectImpl extends Effect {
  light: DirectionalLight
  camera: Camera

  constructor(light: DirectionalLight, camera: Camera, params: VolumetricParams = {}) {
    super('VolumetricLight', fragmentShader, {
      attributes: EffectAttribute.DEPTH,
      uniforms: new Map<string, Uniform>([
        ['tShadowMap', new Uniform<Texture>(fallbackShadowTexture)],
        ['shadowMatrix', new Uniform(new Matrix4())],
        ['inverseProjection', new Uniform(new Matrix4())],
        ['cameraMatrix', new Uniform(new Matrix4())],
        ['cameraPos', new Uniform(new Vector3())],
        ['lightDir', new Uniform(new Vector3(1, 1, 1))],
        ['lightColor', new Uniform(new Vector3(...(params.lightColor ?? [1.0, 0.94, 0.78])))],
        ['uDensity', new Uniform(params.density ?? 0.015)],
        ['uScattering', new Uniform(params.scattering ?? 0.3)],
        ['uMaxDistance', new Uniform(params.maxDistance ?? 15.0)],
        ['uPhaseG', new Uniform(params.phaseG ?? 0.6)],
        ['uNumSteps', new Uniform(params.steps ?? 48)],
        ['resolution', new Uniform(new Vector2(1, 1))],
        ['time', new Uniform(0)],
        ['uDebugMode', new Uniform(params.debugMode ?? 0)],
      ]),
    })
    this.light = light
    this.camera = camera
  }

  private _lightWorldPos = new Vector3()

  update(_renderer: WebGLRenderer, _inputBuffer: WebGLRenderTarget, deltaTime?: number) {
    const u = this.uniforms

    // Time for jitter
    const timeU = u.get('time')!
    timeU.value += deltaTime ?? 0.016

    // Shadow map (updated each frame by Three.js when shadows are on)
    const shadow = this.light.shadow
    if (shadow.map) {
      u.get('tShadowMap')!.value = shadow.map.texture
    }
    // else: keep the fallback white texture (means "always lit")

    // Shadow matrix: world → light clip space
    shadow.camera.updateMatrixWorld()
    const sm = u.get('shadowMatrix')!.value as Matrix4
    sm.multiplyMatrices(shadow.camera.projectionMatrix, shadow.camera.matrixWorldInverse)

    // Camera matrices
    ;(u.get('inverseProjection')!.value as Matrix4).copy(this.camera.projectionMatrix).invert()
    ;(u.get('cameraMatrix')!.value as Matrix4).copy(this.camera.matrixWorld)
    ;(u.get('cameraPos')!.value as Vector3).setFromMatrixPosition(this.camera.matrixWorld)

    // Light direction — use world position (scene graph might transform the light)
    this.light.getWorldPosition(this._lightWorldPos)
    ;(u.get('lightDir')!.value as Vector3).copy(this._lightWorldPos).normalize()
  }

  setDebugMode(mode: 0 | 1 | 2 | 3 | 4) {
    this.uniforms.get('uDebugMode')!.value = mode
  }

  setSize(width: number, height: number) {
    const res = this.uniforms.get('resolution')!.value as Vector2
    res.set(width, height)
  }
}
