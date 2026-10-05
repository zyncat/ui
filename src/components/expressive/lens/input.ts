import { clamp, measure, type Optics, type Parts } from './optics';

const KEYBOARD_STEP = 24;
const ACTIVE_CLASS = 'zc-lens--active';

export function bindInput(parts: Parts, optics: Optics, wake: () => void, signal: AbortSignal) {
  const acquire = (clientX: number, clientY: number) => {
    const box = parts.content.getBoundingClientRect();
    optics.pointerX = clientX - box.left;
    optics.pointerY = clientY - box.top;
    if (!optics.acquired) {
      measure(parts, optics);
      optics.acquired = true;
      optics.centreX = optics.pointerX;
      optics.centreY = optics.pointerY;
    }
    optics.engaged = 1;
    parts.stage.classList.add(ACTIVE_CLASS);
    wake();
  };

  const disengage = () => {
    optics.engaged = 0;
    optics.pressed = 0;
    parts.stage.classList.remove(ACTIVE_CLASS);
    wake();
  };

  const track = (event: PointerEvent | MouseEvent) => acquire(event.clientX, event.clientY);

  parts.stage.addEventListener('pointermove', track, { signal });
  parts.stage.addEventListener(
    'pointerdown',
    (event) => {
      track(event);
      optics.pressed = 1;
      wake();
    },
    { signal },
  );
  parts.stage.addEventListener('pointerleave', disengage, { signal });
  window.addEventListener(
    'pointerup',
    () => {
      optics.pressed = 0;
      wake();
    },
    { signal },
  );

  parts.stage.addEventListener(
    'keydown',
    (event) => {
      const step =
        event.key === 'ArrowLeft'
          ? [-KEYBOARD_STEP, 0]
          : event.key === 'ArrowRight'
            ? [KEYBOARD_STEP, 0]
            : event.key === 'ArrowUp'
              ? [0, -KEYBOARD_STEP]
              : event.key === 'ArrowDown'
                ? [0, KEYBOARD_STEP]
                : null;
      if (step) {
        event.preventDefault();
        if (!optics.acquired) {
          measure(parts, optics);
          optics.acquired = true;
          optics.pointerX = optics.width / 2;
          optics.pointerY = optics.height / 2;
          optics.centreX = optics.pointerX;
          optics.centreY = optics.pointerY;
        } else {
          optics.pointerX = clamp(optics.pointerX + step[0], 0, optics.width);
          optics.pointerY = clamp(optics.pointerY + step[1], 0, optics.height);
        }
        optics.engaged = 1;
        parts.stage.classList.add(ACTIVE_CLASS);
        wake();
        return;
      }
      if (event.key === 'Escape' && optics.engaged) {
        event.preventDefault();
        disengage();
      }
    },
    { signal },
  );

  parts.stage.addEventListener('blur', disengage, { signal });
}
