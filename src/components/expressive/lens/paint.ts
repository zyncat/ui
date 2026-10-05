import type { Optics, Parts } from './optics';

const RIM_CROWD = 0.3;
const SPEED_REFERENCE = 26;
const PRESS_SCALE = 0.035;
const SHADOW_LIFT_BASE = 10;
const SHADOW_LIFT_SPEED = 18;
const SHADOW_LIFT_PRESS = 6;
const SHADOW_BLUR_BASE = 26;
const SHADOW_BLUR_SPEED = 26;
const SHADOW_BLUR_PRESS = 12;
const SHADOW_ALPHA_BASE = 0.26;
const SHADOW_ALPHA_PRESS = 0.08;
const FRINGE_BASE = 0.34;
const FRINGE_SPEED = 0.5;
const SPECULAR_ORBIT_BASE = 0.46;
const SPECULAR_ORBIT_SPEED = 0.1;
const SPECULAR_WIDTH = 1.05;
const SPECULAR_HEIGHT = 0.44;
const SPECULAR_OPACITY_BASE = 0.16;
const SPECULAR_OPACITY_SPEED = 0.44;

export function paint(parts: Parts, optics: Optics, radius: number, chromatic: boolean) {
  const magnification = Math.max(1, optics.magnification);
  const speed = Math.min(1, optics.speed / SPEED_REFERENCE);
  const press = optics.press;

  parts.glass.style.width = `${radius * 2}px`;
  parts.glass.style.height = `${radius * 2}px`;
  parts.glass.style.opacity = optics.opacity.toFixed(3);
  parts.glass.style.translate = `${optics.offsetX + optics.centreX - radius}px ${optics.offsetY + optics.centreY - radius}px`;
  parts.glass.style.scale = String(1 - press * PRESS_SCALE);

  const place = (layer: HTMLElement, scale: number) => {
    const copy = layer.firstElementChild as HTMLElement | null;
    if (!copy) return;
    copy.style.left = `${-(optics.centreX - radius)}px`;
    copy.style.top = `${-(optics.centreY - radius)}px`;
    copy.style.transformOrigin = `${optics.centreX}px ${optics.centreY}px`;
    copy.style.scale = String(scale);
  };
  place(parts.core, magnification);
  place(parts.rim, magnification + RIM_CROWD * (magnification - 1));

  parts.fringe.style.opacity = chromatic ? (FRINGE_BASE + speed * FRINGE_SPEED).toFixed(3) : '0';

  const lift = SHADOW_LIFT_BASE + speed * SHADOW_LIFT_SPEED - press * SHADOW_LIFT_PRESS;
  const blur = SHADOW_BLUR_BASE + speed * SHADOW_BLUR_SPEED - press * SHADOW_BLUR_PRESS;
  parts.ring.style.setProperty('--_lens-lift', lift.toFixed(2));
  parts.ring.style.setProperty('--_lens-blur', blur.toFixed(2));
  parts.ring.style.setProperty('--_lens-shadow-alpha', (SHADOW_ALPHA_BASE + press * SHADOW_ALPHA_PRESS).toFixed(3));

  const trailing = optics.angle + Math.PI;
  const orbit = radius * (SPECULAR_ORBIT_BASE + speed * SPECULAR_ORBIT_SPEED);
  parts.specular.style.width = `${radius * SPECULAR_WIDTH}px`;
  parts.specular.style.height = `${radius * SPECULAR_HEIGHT}px`;
  parts.specular.style.opacity = (SPECULAR_OPACITY_BASE + speed * SPECULAR_OPACITY_SPEED).toFixed(3);
  parts.specular.style.translate = `calc(-50% + ${(Math.cos(trailing) * orbit).toFixed(1)}px) calc(-50% + ${(Math.sin(trailing) * orbit).toFixed(1)}px)`;
  parts.specular.style.rotate = `${((trailing * 180) / Math.PI).toFixed(1)}deg`;
}
