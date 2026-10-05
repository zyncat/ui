const MAX_STEP = 3;
const MOVE_THRESHOLD = 0.4;
const SPEED_SMOOTHING = 0.25;
const MAGNIFICATION_EASE = 0.24;
const OPACITY_EASE = 0.2;
const OPACITY_REST = 0.002;
const PRESS_EASE = 0.28;

export const clamp = (v: number, min: number, max: number) => (v < min ? min : v > max ? max : v);

export interface Optics {
  pointerX: number;
  pointerY: number;
  centreX: number;
  centreY: number;
  magnification: number;
  opacity: number;
  engaged: number;
  pressed: number;
  press: number;
  speed: number;
  angle: number;
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
  acquired: boolean;
  dirty: boolean;
  sinceClone: number;
}

export interface Parts {
  stage: HTMLElement;
  content: HTMLElement;
  glass: HTMLElement;
  core: HTMLElement;
  rim: HTMLElement;
  fringe: HTMLElement;
  specular: HTMLElement;
  ring: HTMLElement;
}

export const createOptics = (): Optics => ({
  pointerX: 0,
  pointerY: 0,
  centreX: 0,
  centreY: 0,
  magnification: 1,
  opacity: 0,
  engaged: 0,
  pressed: 0,
  press: 0,
  speed: 0,
  angle: 0,
  width: 0,
  height: 0,
  offsetX: 0,
  offsetY: 0,
  acquired: false,
  dirty: false,
  sinceClone: 0,
});

export function cloneInto(host: HTMLElement, content: HTMLElement, width: number, height: number) {
  host.textContent = '';
  const copy = content.cloneNode(true) as HTMLElement;
  copy.setAttribute('aria-hidden', 'true');
  copy.classList.add('zc-lens__copy');
  if (width && height) {
    copy.style.width = `${width}px`;
    copy.style.height = `${height}px`;
  }
  host.appendChild(copy);
}

export function measure(parts: Parts, optics: Optics) {
  const box = parts.content.getBoundingClientRect();
  if (!box.width || !box.height) return;
  optics.width = box.width;
  optics.height = box.height;
  const host = (parts.glass.offsetParent as HTMLElement | null) ?? parts.stage;
  const hostBox = host.getBoundingClientRect();
  optics.offsetX = box.left - hostBox.left;
  optics.offsetY = box.top - hostBox.top;
  for (const layer of [parts.core, parts.rim]) {
    const copy = layer.firstElementChild as HTMLElement | null;
    if (copy) {
      copy.style.width = `${box.width}px`;
      copy.style.height = `${box.height}px`;
    }
  }
}

export function advance(optics: Optics, k: number, magnification: number) {
  const step = Math.min(MAX_STEP, k);
  const previousX = optics.centreX;
  const previousY = optics.centreY;
  optics.centreX = optics.pointerX;
  optics.centreY = optics.pointerY;
  const travelled = Math.hypot(optics.centreX - previousX, optics.centreY - previousY);
  optics.speed += (travelled - optics.speed) * SPEED_SMOOTHING * step;
  if (travelled > MOVE_THRESHOLD) optics.angle = Math.atan2(optics.centreY - previousY, optics.centreX - previousX);

  const target = optics.engaged ? magnification : 1;
  optics.magnification += (target - optics.magnification) * MAGNIFICATION_EASE * step;
  optics.opacity += ((optics.acquired && optics.engaged ? 1 : 0) - optics.opacity) * OPACITY_EASE * step;
  optics.press += (optics.pressed - optics.press) * PRESS_EASE * step;
}

export const atRest = (optics: Optics) => !optics.engaged && !optics.dirty && optics.opacity < OPACITY_REST;

export function settle(optics: Optics, magnification: number) {
  optics.magnification = optics.engaged ? magnification : 1;
  optics.opacity = optics.acquired && optics.engaged ? 1 : 0;
  optics.press = optics.pressed;
  optics.centreX = optics.pointerX;
  optics.centreY = optics.pointerY;
  optics.speed = 0;
}
