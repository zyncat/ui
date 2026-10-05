import { sharedSlot } from '../shared-slot';
import { animate, type Layer, type Playback } from './animate';
import type { Timing } from './ease';

export interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

const MOVE_EPSILON = 0.5;
const SCALE_EPSILON = 0.01;
const TOP_LEFT = { x: 0, y: 0 };
const OFFSCREEN_MARGIN_PX = 100;

function transformOrigin(el: HTMLElement): { x: number; y: number } {
  const [x, y] = getComputedStyle(el).transformOrigin.split(' ');
  return { x: parseFloat(x), y: parseFloat(y) };
}

const writesTranslate = (animation: Animation): boolean =>
  animation.effect instanceof KeyframeEffect && animation.effect.getKeyframes().some((frame) => 'translate' in frame);

const untranslated = (el: HTMLElement): boolean =>
  getComputedStyle(el).translate === 'none' && !el.getAnimations().some(writesTranslate);

export function measure(el: HTMLElement): Box {
  const rect = el.getBoundingClientRect();
  return { left: rect.left + window.scrollX, top: rect.top + window.scrollY, width: rect.width, height: rect.height };
}

export function offscreen(margin = OFFSCREEN_MARGIN_PX, a: Box, b: Box = a): boolean {
  const outside = (start: number, end: number, scroll: number, span: number): boolean =>
    end < scroll - margin || start > scroll + span + margin;
  return (
    outside(Math.min(a.top, b.top), Math.max(a.top + a.height, b.top + b.height), window.scrollY, window.innerHeight) ||
    outside(Math.min(a.left, b.left), Math.max(a.left + a.width, b.left + b.width), window.scrollX, window.innerWidth)
  );
}

const shared = sharedSlot('engine.flip-shared@1', () => new Map<string, Box>());

export function keepShared(key: string, box: Box): void {
  shared.set(key, box);
}

export function readShared(key: string): Box | null {
  return shared.get(key) ?? null;
}

export function dropShared(key: string): void {
  shared.delete(key);
}

export interface FlipOptions {
  /** How a changed box size is reconciled: cheap scale correction, a real width/height morph, or left alone. */
  size?: 'scale' | 'morph' | 'none';
  timing?: Timing;
}

export function flip(el: HTMLElement, from: Box, options: FlipOptions = {}): Playback | null {
  const layers = flipLayers(el, from, measure(el), options);
  return layers && animate(el, ...layers);
}

export function flipLayers(el: HTMLElement, from: Box, to: Box, options: FlipOptions = {}): Layer[] | null {
  if (!to.width || !to.height) return null;

  const size = options.size ?? 'scale';
  const sx = from.width / to.width;
  const sy = from.height / to.height;

  const moved = Math.abs(from.left - to.left) > MOVE_EPSILON || Math.abs(from.top - to.top) > MOVE_EPSILON;
  const resized = size !== 'none' && (Math.abs(sx - 1) > SCALE_EPSILON || Math.abs(sy - 1) > SCALE_EPSILON);
  if (!moved && !resized) return null;

  const scaling = resized && size === 'scale';
  const pivot = scaling ? transformOrigin(el) : TOP_LEFT;
  const dx = from.left - to.left + pivot.x * (sx - 1);
  const dy = from.top - to.top + pivot.y * (sy - 1);

  const holdsStartThroughDelay = (options.timing?.delay ?? 0) > 0;
  const timing: Timing = {
    ...options.timing,
    fill: options.timing?.fill ?? (holdsStartThroughDelay ? 'backwards' : 'none'),
  };
  const layers: Layer[] = [{ x: [dx, 0], y: [dy, 0], timing, composite: untranslated(el) ? 'replace' : 'add' }];
  if (scaling)
    layers.push({
      scale: [
        [sx, sy],
        [1, 1],
      ],
      timing,
    });
  if (resized && size === 'morph')
    layers.push({ width: [from.width, to.width], height: [from.height, to.height], timing });

  return layers;
}
