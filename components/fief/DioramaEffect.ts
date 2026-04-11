import { Effect, BlendFunction } from 'postprocessing'
import { Uniform, Vector2, WebGLRenderer, WebGLRenderTarget } from 'three'
import { wrapEffect } from '@react-three/postprocessing'

const fragmentShader = /* glsl */ `
uniform vec2 resolution;
uniform float time;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  vec2 tx = 1.0 / resolution;
  vec3 c = inputColor.rgb;

  // === 1. Tilt-shift blur (top & bottom bands) ===
  float blurZone = smoothstep(0.0, 0.25, abs(uv.y - 0.5));
  if (blurZone > 0.01) {
    vec3 blurred = vec3(0.0);
    float total = 0.0;
    for (float x = -3.0; x <= 3.0; x += 1.0) {
      for (float y = -3.0; y <= 3.0; y += 1.0) {
        float w = 1.0 - length(vec2(x, y)) / 4.24;
        w = max(w, 0.0);
        blurred += texture2D(inputBuffer, uv + vec2(x, y) * tx * 2.0).rgb * w;
        total += w;
      }
    }
    blurred /= total;
    c = mix(c, blurred, blurZone * 0.6);
  }

  // === 2. Desaturate slightly + push toward warm white ===
  float luma = dot(c, vec3(0.299, 0.587, 0.114));
  c = mix(c, vec3(luma), 0.15);                    // desaturate 15%
  c = mix(c, vec3(0.98, 0.96, 0.93), 0.12);        // warm white wash

  // === 3. Soft ambient occlusion from edges ===
  float edgeAO = 0.0;
  for (float x = -2.0; x <= 2.0; x += 1.0) {
    for (float y = -2.0; y <= 2.0; y += 1.0) {
      vec3 s = texture2D(inputBuffer, uv + vec2(x, y) * tx * 1.5).rgb;
      edgeAO += abs(luma - dot(s, vec3(0.299, 0.587, 0.114)));
    }
  }
  edgeAO /= 25.0;
  // Subtle darkening in crevices
  c *= 1.0 - edgeAO * 0.8;

  // === 4. Soft edge lines (very subtle, ink-like) ===
  float gx = 0.0, gy = 0.0;
  float tl = dot(texture2D(inputBuffer, uv + vec2(-tx.x, tx.y)).rgb, vec3(0.33));
  float tr = dot(texture2D(inputBuffer, uv + vec2(tx.x, tx.y)).rgb, vec3(0.33));
  float bl = dot(texture2D(inputBuffer, uv + vec2(-tx.x, -tx.y)).rgb, vec3(0.33));
  float br = dot(texture2D(inputBuffer, uv + vec2(tx.x, -tx.y)).rgb, vec3(0.33));
  float ml = dot(texture2D(inputBuffer, uv + vec2(-tx.x, 0.0)).rgb, vec3(0.33));
  float mr = dot(texture2D(inputBuffer, uv + vec2(tx.x, 0.0)).rgb, vec3(0.33));
  float mt = dot(texture2D(inputBuffer, uv + vec2(0.0, tx.y)).rgb, vec3(0.33));
  float mb = dot(texture2D(inputBuffer, uv + vec2(0.0, -tx.y)).rgb, vec3(0.33));
  gx = -tl - 2.0 * ml - bl + tr + 2.0 * mr + br;
  gy = -tl - 2.0 * mt - tr + bl + 2.0 * mb + br;
  float edge = sqrt(gx * gx + gy * gy);
  float line = smoothstep(0.06, 0.15, edge);
  c = mix(c, vec3(0.55, 0.50, 0.45), line * 0.2);

  // === 5. Very fine grain (maquette/paper feel) ===
  float grain = noise(uv * 200.0 + time * 0.5) * 0.03 - 0.015;
  c += grain;

  // === 6. Soft vignette ===
  float vig = 1.0 - smoothstep(0.4, 0.9, length((uv - 0.5) * vec2(1.1, 1.0)));
  c *= 0.92 + vig * 0.08;

  // === 7. Slight bloom on bright areas ===
  float brightness = dot(c, vec3(0.299, 0.587, 0.114));
  if (brightness > 0.7) {
    c += (brightness - 0.7) * vec3(0.05, 0.04, 0.03);
  }

  outputColor = vec4(c, inputColor.a);
}
`

class DioramaEffectImpl extends Effect {
  constructor() {
    super('DioramaEffect', fragmentShader, {
      blendFunction: BlendFunction.NORMAL,
      uniforms: new Map<string, Uniform>([
        ['resolution', new Uniform(new Vector2(1, 1))],
        ['time', new Uniform(0)],
      ]),
    })
  }

  update(
    _renderer: WebGLRenderer,
    _inputBuffer: WebGLRenderTarget,
    deltaTime?: number,
  ) {
    const timeUniform = this.uniforms.get('time')!
    timeUniform.value += deltaTime || 0.016
  }

  setSize(width: number, height: number) {
    const res = this.uniforms.get('resolution')!
    ;(res.value as Vector2).set(width, height)
  }
}

export const Diorama = wrapEffect(DioramaEffectImpl)
