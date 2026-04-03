import { Effect, BlendFunction } from 'postprocessing'
import { Uniform, Vector2, WebGLRenderer, WebGLRenderTarget } from 'three'
import { wrapEffect } from '@react-three/postprocessing'

const fragmentShader = /* glsl */ `
uniform vec2 resolution;
uniform float time;

float hash2(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5);
}

float noise2(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash2(i), hash2(i + vec2(1.0, 0.0)), f.x),
    mix(hash2(i + vec2(0.0, 1.0)), hash2(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

float fbm2(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 3; i++) {
    v += a * noise2(p);
    p *= 2.0;
    a *= 0.5;
  }
  return v;
}

float getEdge(vec2 uv, vec2 tx) {
  float w = fbm2(uv * 50.0 + time * 0.15) * 0.001;
  float tl = length(texture2D(inputBuffer, uv + vec2(-tx.x, tx.y) + w).rgb);
  float tr = length(texture2D(inputBuffer, uv + vec2(tx.x, tx.y) + w).rgb);
  float ml = length(texture2D(inputBuffer, uv + vec2(-tx.x, 0.0) + w).rgb);
  float mr = length(texture2D(inputBuffer, uv + vec2(tx.x, 0.0) + w).rgb);
  float bl = length(texture2D(inputBuffer, uv + vec2(-tx.x, -tx.y) + w).rgb);
  float br = length(texture2D(inputBuffer, uv + vec2(tx.x, -tx.y) + w).rgb);
  float mt = length(texture2D(inputBuffer, uv + vec2(0.0, tx.y) + w).rgb);
  float mb = length(texture2D(inputBuffer, uv + vec2(0.0, -tx.y) + w).rgb);
  float gx = -tl - 2.0 * ml - bl + tr + 2.0 * mr + br;
  float gy = -tl - 2.0 * mt - tr + bl + 2.0 * mb + br;
  return sqrt(gx * gx + gy * gy);
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  vec2 tx = 1.0 / resolution;

  // Subtle UV distortion for hand-painted feel
  vec2 distortedUv = uv + (fbm2(uv * 60.0 + time * 0.06) - 0.5) * 0.0015;

  // Sample with pigment bleeding (average neighbors)
  vec4 center = texture2D(inputBuffer, distortedUv);
  vec4 bleed = vec4(0.0);
  for (float x = -1.0; x <= 1.0; x += 1.0) {
    for (float y = -1.0; y <= 1.0; y += 1.0) {
      bleed += texture2D(inputBuffer, distortedUv + vec2(x, y) * tx * 1.2);
    }
  }
  bleed /= 9.0;
  vec3 c = mix(center.rgb, bleed.rgb, 0.18);

  // Color quantization (watercolor posterization)
  float levels = 8.0;
  c = floor(c * levels + 0.5) / levels;

  // Parchment tint
  c = mix(c, vec3(0.96, 0.93, 0.88), 0.1);

  // Paper texture (FBM noise)
  float paper = fbm2(uv * 80.0) * 0.05 - 0.025;
  c += paper;

  // Sobel edge detection with hand-drawn line overlay
  float edge = getEdge(uv, tx);
  float lineNoise = fbm2(uv * 100.0 + time * 0.1);
  float threshold = 0.1 + lineNoise * 0.05;
  float lineStrength = smoothstep(threshold - 0.03, threshold + 0.02, edge);
  vec3 lineColor = vec3(0.22, 0.18, 0.15);
  c = mix(c, lineColor, lineStrength * (0.4 + lineNoise * 0.3));

  // Fine grain
  c += (fbm2(uv * 180.0) - 0.5) * 0.03;

  // Vignette
  float vig = 1.0 - smoothstep(0.35, 0.85, length(uv - 0.5) * 1.1);
  c *= 0.9 + vig * 0.1;

  outputColor = vec4(c, inputColor.a);
}
`

class WatercolorEffectImpl extends Effect {
  constructor() {
    super('WatercolorEffect', fragmentShader, {
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

export const Watercolor = wrapEffect(WatercolorEffectImpl)
