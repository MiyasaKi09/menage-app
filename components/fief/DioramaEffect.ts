import { Effect, BlendFunction } from 'postprocessing'
import { Uniform, Vector2, WebGLRenderer, WebGLRenderTarget } from 'three'
import { wrapEffect } from '@react-three/postprocessing'

const fragmentShader = /* glsl */ `
uniform vec2 resolution;
uniform float time;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  vec2 tx = 1.0 / resolution;
  vec3 c = inputColor.rgb;

  // === 1. Tilt-shift — gentle depth-of-field at edges ===
  float focus = smoothstep(0.0, 0.3, abs(uv.y - 0.45));
  if (focus > 0.01) {
    vec3 blurred = vec3(0.0);
    float total = 0.0;
    for (float x = -2.0; x <= 2.0; x += 1.0) {
      for (float y = -2.0; y <= 2.0; y += 1.0) {
        float w = 1.0 - length(vec2(x, y)) / 2.83;
        w = max(w, 0.0);
        blurred += texture2D(inputBuffer, uv + vec2(x, y) * tx * 1.5).rgb * w;
        total += w;
      }
    }
    blurred /= total;
    c = mix(c, blurred, focus * 0.35);
  }

  // === 2. Lift shadows, compress dynamic range (maquette look) ===
  c = c * 0.85 + 0.15;   // lift blacks
  c = pow(c, vec3(0.95)); // slight gamma lift

  // === 3. Desaturate + warm shift ===
  float luma = dot(c, vec3(0.299, 0.587, 0.114));
  c = mix(c, vec3(luma), 0.1);
  c = mix(c, vec3(1.0, 0.98, 0.95), 0.06);

  // === 4. Subtle SSAO from screen-space neighbors ===
  float ao = 0.0;
  for (float x = -1.0; x <= 1.0; x += 1.0) {
    for (float y = -1.0; y <= 1.0; y += 1.0) {
      vec3 s = texture2D(inputBuffer, uv + vec2(x, y) * tx * 2.0).rgb;
      ao += abs(luma - dot(s, vec3(0.299, 0.587, 0.114)));
    }
  }
  ao /= 9.0;
  c *= 1.0 - ao * 0.4;

  // === 5. Very soft vignette ===
  float vig = 1.0 - smoothstep(0.5, 1.0, length((uv - 0.5) * 1.2));
  c *= 0.95 + vig * 0.05;

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
