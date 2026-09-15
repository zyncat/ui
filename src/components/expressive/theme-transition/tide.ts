import { clamp, easeInOut, easeOut, sample, SAMPLE_MS, TAU, type EffectFactory } from './scene';

const DURATION = { polarity: 1250, palette: 560 };
const POINTS = 72;
const POLARITY_WAVE = { heightShare: 0.085, maxAmplitude: 96, margin: 24 };
const PALETTE_WAVE = { widthShare: 0.02, maxAmplitude: 26, tiltShare: 0.16, margin: 16 };
const REST_AMPLITUDE = 0.3;

const waveOf = (points: string[], close: string) => `path("M${points.join(' L')} ${close}")`;

export const tide: EffectFactory = (scene) => {
  const { width: W, height: H, kind, direction } = scene;
  const intensity = Math.max(0, scene.intensity);

  const polarityFrame = (p: number, t: number) => {
    const points: string[] = [];
    const e = easeInOut(p);
    const env = Math.sin(Math.PI * p);
    const A0 = Math.min(H * POLARITY_WAVE.heightShare, POLARITY_WAVE.maxAmplitude) * intensity;
    const amp = A0 * (REST_AMPLITUDE + (1 - REST_AMPLITUDE) * env);
    const m = A0 + POLARITY_WAVE.margin;
    const span = H + 2 * m;
    const down = direction === 'down';
    const front = down ? -m + e * span : H + m - e * span;
    for (let i = 0; i <= POINTS; i++) {
      const u = i / POINTS;
      const y =
        front +
        amp *
          (Math.sin(u * TAU * 1.15 + t * 0.0012) +
            0.55 * Math.sin(u * TAU * 2.35 - t * 0.0019 + 1.7) +
            0.22 * Math.sin(u * TAU * 4.1 + t * 0.0031));
      points.push(`${(W * u).toFixed(1)} ${y.toFixed(1)}`);
    }
    return waveOf(points, down ? `L${W} 0 L0 0Z` : `L${W} ${H} L0 ${H}Z`);
  };

  if (kind === 'polarity') {
    return { duration: DURATION.polarity, clips: sample(DURATION.polarity, SAMPLE_MS, polarityFrame) };
  }

  const swell = Math.min(W * PALETTE_WAVE.widthShare, PALETTE_WAVE.maxAmplitude) * intensity;
  const tilt = H * PALETTE_WAVE.tiltShare;
  const margin = swell + tilt / 2 + PALETTE_WAVE.margin;
  const reach = (p: number) => easeOut(p) * (W + 2 * margin) - margin;

  const paletteFrame = (p: number, t: number) => {
    const points: string[] = [];
    const env = Math.sin(Math.PI * p);
    const amp = swell * (REST_AMPLITUDE + (1 - REST_AMPLITUDE) * env);
    const right = direction === 'right';
    const front = right ? reach(p) : W - reach(p);
    const sign = right ? 1 : -1;
    for (let i = 0; i <= POINTS; i++) {
      const v = i / POINTS;
      const x =
        front +
        (v - 0.5) * tilt * sign +
        amp * (Math.sin(v * TAU * 1.3 + t * 0.002) + 0.5 * Math.sin(v * TAU * 2.8 - t * 0.003 + 1));
      points.push(`${x.toFixed(1)} ${(H * v).toFixed(1)}`);
    }
    return waveOf(points, right ? `L0 ${H} L0 0Z` : `L${W} ${H} L${W} 0Z`);
  };

  return {
    duration: DURATION.palette,
    clips: sample(DURATION.palette, SAMPLE_MS, paletteFrame),
    wash: sample(DURATION.palette, SAMPLE_MS, (p) => [reach(p), clamp((reach(p) - W) / margin, 0, 1)] as const),
  };
};
