import { animate, measure, type Box, type FlipOptions, type Playback } from '../engine';
import { claim } from '../engine/animate';
import { sharedSlot } from '../shared-slot';
import { inheritedThemeAttrs } from '../theme-scope';

const SHOWN_BY = 0.45;
const GONE_BY = 0.5;

interface Copy {
  el: HTMLElement;
  box: Box;
  of: HTMLElement;
  play?: Playback;
}

const kept = sharedSlot('motion.crossfade@2', () => new Map<string, Copy>());
const riding = new WeakMap<HTMLElement, Copy>();

function onto(el: HTMLElement, box: Box, target: Box): { x: number; y: number; scale: number } {
  const [px, py] = getComputedStyle(el).transformOrigin.split(' ').map(parseFloat);
  const scale = target.width / box.width;
  return {
    x: target.left - box.left + (target.width - box.width) / 2 + (box.width / 2 - px) * (1 - scale),
    y: target.top - box.top + (target.height - box.height) / 2 + (box.height / 2 - py) * (1 - scale),
    scale,
  };
}

export function keep(id: string, el: HTMLElement, box: Box, { timing }: FlipOptions): void {
  const copy = el.cloneNode(true) as HTMLElement;
  for (const node of [copy, ...copy.querySelectorAll('[id]')]) node.removeAttribute('id');
  for (const [name, value] of Object.entries(inheritedThemeAttrs(el))) if (value) copy.setAttribute(name, value);
  const { font, color, opacity } = getComputedStyle(el);
  Object.assign(copy.style, {
    position: 'fixed',
    left: `${box.left - window.scrollX}px`,
    top: `${box.top - window.scrollY}px`,
    width: `${box.width}px`,
    height: `${box.height}px`,
    boxSizing: 'border-box',
    margin: '0',
    pointerEvents: 'none',
    translate: 'none',
    scale: 'none',
    transform: 'none',
    font,
    color,
    opacity,
  });
  copy.inert = true;
  copy.setAttribute('aria-hidden', 'true');
  document.body.append(copy);
  const entry: Copy = { el: copy, box, of: el };
  kept.set(id, entry);
  queueMicrotask(() => {
    if (kept.get(id) !== entry) return;
    kept.delete(id);
    if (el.isConnected) copy.remove();
    else animate(copy, { opacity: [0], timing }).finished.then(() => copy.remove());
  });
}

export function play(id: string, el: HTMLElement, from: Box, { timing }: FlipOptions): Playback | undefined {
  const next = kept.get(id);
  if (!next) return undefined;
  const replay = next.of === el;
  const copy = replay ? riding.get(el) : next;
  if (!copy) return undefined;
  claim(el, ['translate', 'scale', 'opacity'], null);
  const to = measure(el);
  if (!to.width || !to.height) return undefined;
  kept.delete(id);
  if (replay) next.el.remove();
  copy.play?.stop();
  const rest = Number(getComputedStyle(el).opacity);
  const out = onto(copy.el, copy.box, to);
  const back = onto(el, to, from);
  const run = animate(copy.el, {
    x: [0, out.x],
    y: [0, out.y],
    scale: [1, out.scale],
    opacity: [Number(copy.el.style.opacity), 0, 0],
    timing: { fill: 'backwards', ...timing, times: [0, GONE_BY, 1] },
  });
  copy.play = run;
  riding.set(el, copy);
  run.finished.then(() => {
    if (copy.play === run) copy.el.remove();
  });
  return animate(el, {
    x: [back.x, 0],
    y: [back.y, 0],
    scale: [back.scale, 1],
    opacity: [0, rest, rest],
    timing: { fill: 'backwards', ...timing, times: [0, SHOWN_BY, 1] },
  });
}
