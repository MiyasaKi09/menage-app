import { Effect, EffectAttribute } from 'postprocessing'
import {
  Uniform,
  Vector2,
  Vector3,
  Matrix4,
  Camera,
  Texture,
  DataTexture,
  RedFormat,
  UnsignedByteType,
  WebGLRenderer,
  WebGLRenderTarget,
} from 'three'

/**
 * Volumetric light pass — ray marches through scene using an externally-provided
 * shadow depth texture (rendered from the light's POV in a controlled format).
 */

// Fallback white 1x1 texture
const fallbackShadowTexture = (() => {
  const data = new Uint8Array([255])
  const tex = new DataTexture(data, 1, 1, RedFormat, UnsignedByteType)
  tex.needsUpdate = true
  return tex
})()

const fragmentShader = /* glsl */ `
uniform sampler2D tShadowMap;     // Real DepthTexture — no unpacking
uniform mat4 shadowMatrix;        // world → shadow UV [0,1]
uniform mat4 inverseProjection;
uniform mat4 cameraMatrix;
uniform vec3 cameraPos;
uniform vec3 lightDir;
uniform vec3 lightColor;
uniform float uDensity;
uniform float uScattering;
uniform float uMaxDistance;
uniform float uPhaseG;
uniform int uNumSteps;
uniform vec2 resolution;
uniform float time;
uniform int uDebugMode;

float ign(vec2 p) {
  vec3 magic = vec3(0.06711056, 0.00583715, 52.9829189);
  return fract(magic.z * fract(dot(p, magic.xy)));
}

// Low-cost 3D hash for dust density variation
float dustHash(vec3 p) {
  p = fract(p * vec3(443.8975, 397.2973, 491.1871));
  p += dot(p.zxy, p.yxz + 19.19);
  return fract(p.x * p.y * p.z);
}
float dustNoise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(dustHash(i), dustHash(i+vec3(1,0,0)), f.x),
        mix(dustHash(i+vec3(0,1,0)), dustHash(i+vec3(1,1,0)), f.x), f.y),
    mix(mix(dustHash(i+vec3(0,0,1)), dustHash(i+vec3(1,0,1)), f.x),
        mix(dustHash(i+vec3(0,1,1)), dustHash(i+vec3(1,1,1)), f.x), f.y),
    f.z
  );
}

vec3 worldPosFromDepth(vec2 uv, float depth) {
  vec4 clip = vec4(uv * 2.0 - 1.0, depth * 2.0 - 1.0, 1.0);
  vec4 view = inverseProjection * clip;
  view /= view.w;
  vec4 world = cameraMatrix * view;
  return world.xyz;
}

// Direct depth texture read — no RGBA unpacking
float sampleShadow(vec3 worldPos) {
  vec4 sc = shadowMatrix * vec4(worldPos, 1.0);
  vec3 shadowCoord = sc.xyz / sc.w;

  if (shadowCoord.x < 0.0 || shadowCoord.x > 1.0 ||
      shadowCoord.y < 0.0 || shadowCoord.y > 1.0 ||
      shadowCoord.z < 0.0 || shadowCoord.z > 1.0) {
    return 1.0;
  }

  float shadowDepth = texture2D(tShadowMap, shadowCoord.xy).r;
  float bias = 0.005;
  return shadowCoord.z - bias <= shadowDepth ? 1.0 : 0.0;
}

float phaseHG(float cosTheta, float g) {
  float g2 = g * g;
  float denom = 1.0 + g2 - 2.0 * g * cosTheta;
  return (1.0 - g2) / (4.0 * 3.14159 * pow(max(denom, 1e-4), 1.5));
}

void mainImage(const in vec4 inputColor, const in vec2 uv, const in float depth, out vec4 outputColor) {
  vec3 worldEnd = worldPosFromDepth(uv, depth);

  // Debug modes
  if (uDebugMode == 1) {
    outputColor = vec4(fract(worldEnd * 0.3 + 0.5), 1.0);
    return;
  }
  if (uDebugMode == 2) {
    float s = sampleShadow(worldEnd);
    outputColor = vec4(vec3(s), 1.0);
    return;
  }
  if (uDebugMode == 3) {
    outputColor = vec4(vec3(depth), 1.0);
    return;
  }
  if (uDebugMode == 4) {
    outputColor = vec4(lightDir * 0.5 + 0.5, 1.0);
    return;
  }
  if (uDebugMode == 5) {
    // Sample shadow map directly at UV
    outputColor = vec4(vec3(texture2D(tShadowMap, uv).r), 1.0);
    return;
  }

  vec3 rayDir = normalize(worldEnd - cameraPos);
  float rayLen = min(length(worldEnd - cameraPos), uMaxDistance);

  int steps = uNumSteps;
  float stepSize = rayLen / float(steps);
  float jitter = ign(gl_FragCoord.xy + time * 60.0) * stepSize;

  float cosTheta = dot(rayDir, -normalize(lightDir));
  float phase = phaseHG(cosTheta, uPhaseG);

  vec3 scattered = vec3(0.0);
  float transmittance = 1.0;

  for (int i = 0; i < 128; i++) {
    if (i >= steps) break;
    float t = float(i) * stepSize + jitter;
    if (t >= rayLen) break;

    vec3 samplePos = cameraPos + rayDir * t;
    float lit = sampleShadow(samplePos);

    // Density denser near floor (settled dust), with slow animated 3D noise patches
    float heightFactor = 1.0 + 0.6 * (1.0 - smoothstep(0.0, 2.0, samplePos.y));
    float noiseSample = dustNoise(samplePos * 2.5 + vec3(0.0, time * 0.04, time * 0.02));
    float dustPatch = 0.6 + 0.4 * noiseSample;
    float localDensity = uDensity * heightFactor * dustPatch;

    vec3 inScatter = lightColor * uScattering * phase * lit * localDensity;
    transmittance *= exp(-localDensity * stepSize);
    scattered += inScatter * transmittance * stepSize;
  }

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
  debugMode?: 0 | 1 | 2 | 3 | 4 | 5
}

export class VolumetricLightEffectImpl extends Effect {
  camera: Camera

  constructor(camera: Camera, params: VolumetricParams = {}) {
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
    this.camera = camera
  }

  update(_renderer: WebGLRenderer, _inputBuffer: WebGLRenderTarget, deltaTime?: number) {
    const u = this.uniforms

    const timeU = u.get('time')!
    timeU.value += deltaTime ?? 0.016

    // Camera matrices — the only thing we update per-frame here
    ;(u.get('inverseProjection')!.value as Matrix4).copy(this.camera.projectionMatrix).invert()
    ;(u.get('cameraMatrix')!.value as Matrix4).copy(this.camera.matrixWorld)
    ;(u.get('cameraPos')!.value as Vector3).setFromMatrixPosition(this.camera.matrixWorld)
  }

  setSize(width: number, height: number) {
    const res = this.uniforms.get('resolution')!.value as Vector2
    res.set(width, height)
  }

  // Called externally each frame by the LightDepthPass controller
  setShadowData(tex: Texture, matrix: Matrix4, lightDir: Vector3) {
    this.uniforms.get('tShadowMap')!.value = tex
    ;(this.uniforms.get('shadowMatrix')!.value as Matrix4).copy(matrix)
    ;(this.uniforms.get('lightDir')!.value as Vector3).copy(lightDir).normalize()
  }

  setDebugMode(mode: 0 | 1 | 2 | 3 | 4 | 5) {
    this.uniforms.get('uDebugMode')!.value = mode
  }
}
