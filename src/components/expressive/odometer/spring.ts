const TUNED_AT_HZ = 144;
const DT = 1 / TUNED_AT_HZ;
const SAMPLE_SECONDS = 1 / 120;
const CIRCULAR = [Math.cos, Math.sin, Math.acos] as const;
const HYPERBOLIC = [Math.cosh, Math.sinh, Math.acosh] as const;

export interface Spring {
  at: number;
  rate: number;
  to: number;
  omega: number;
  zeta: number;
}

interface Shape {
  a: number;
  b: number;
  decay: number;
  freq: number;
  fade: number;
  cos: (x: number) => number;
  sin: (x: number) => number;
}

const trim = (n: number) => Math.round(n * 1e4) / 1e4;
const stop = (value: number, progress: number) => `${trim(value)} ${trim(progress * 100)}%`;

function shape(s: Spring): Shape {
  const shrink = 1 - 2 * s.zeta * s.omega * DT;
  const radius = Math.sqrt(shrink);
  const ratio = (1 + shrink - s.omega * s.omega * DT * DT) / (2 * radius);
  const realRoots = ratio > 1;
  const [cos, sin, arc] = realRoots ? HYPERBOLIC : CIRCULAR;
  const turn = arc(ratio);
  const a = s.at - s.to;
  const next = a + (s.rate - (s.omega * s.omega * a + 2 * s.zeta * s.omega * s.rate) * DT) * DT;
  const b = (next / radius - a * cos(turn)) / sin(turn);
  const decay = -Math.log(radius) / DT;
  const freq = turn / DT;
  return { a, b, cos, sin, decay, freq, fade: realRoots ? decay - freq : decay };
}

const offset = (k: Shape, t: number) => Math.exp(-k.decay * t) * (k.a * k.cos(k.freq * t) + k.b * k.sin(k.freq * t));

export function sample(s: Spring, t: number): [at: number, rate: number] {
  const k = shape(s);
  const now = offset(k, t);
  return [s.to + now, (now - offset(k, t - DT)) / DT];
}

export function settleSeconds(s: Spring, rest: number): number {
  const k = shape(s);
  const amplitude = Math.hypot(k.a, k.b);
  return amplitude > rest ? Math.log(amplitude / rest) / k.fade : 0;
}

function track(s: Spring, seconds: number): [x: number, progress: number][] {
  const k = shape(s);
  const steps = Math.max(1, Math.ceil(seconds / SAMPLE_SECONDS));
  const at = (i: number) => (i === 0 ? s.at : i === steps ? s.to : s.to + offset(k, (i / steps) * seconds));
  return Array.from({ length: steps + 1 }, (_, i) => [at(i), i / steps]);
}

export function clampedCurve(s: Spring, seconds: number): string {
  return `linear(${track(s, seconds)
    .map(([x, t]) => stop(Math.min(1, Math.max(0, x)), t))
    .join(', ')})`;
}

export function wrappedCurve(s: Spring, seconds: number, run: number): string {
  const wrap = (x: number) => (((x % run) + run) % run) / run;
  const points: string[] = [];
  let [last, then] = [s.at, 0];
  for (const [x, t] of track(s, seconds)) {
    const lap = Math.floor(last / run);
    const next = Math.floor(x / run);
    if (lap !== next) {
      const edge = Math.max(lap, next) * run;
      const progress = then + ((edge - last) / (x - last)) * (t - then);
      points.push(stop(next > lap ? 1 : 0, progress), stop(next > lap ? 0 : 1, progress));
    }
    points.push(stop(wrap(x), t));
    [last, then] = [x, t];
  }
  return `linear(${points.join(', ')})`;
}
