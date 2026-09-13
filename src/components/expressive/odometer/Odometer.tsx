'use client';

import './odometer.css';

import { useEffect, useMemo, useRef, useState, type HTMLAttributes } from 'react';

import type { DataAttributes } from '../../../dom-props';
import { loop } from '../../../engine';
import type { OdometerStyle } from '../../../tokens/component-styles.generated';
import { motionFor } from '../../../tokens/motion-tokens';
import { cx } from '../../internal/utils/cx';
import { aim, CELLS, charAt, DIGIT, MIN_ROLL, parts, snap, step, type Place, type Slot } from './roll';

const affix = (chars: string) =>
  chars && (
    <span className="zc-odometer__separator" aria-hidden="true">
      {chars}
    </span>
  );

export interface OdometerOwnProps {
  /** The number to roll to. Digits roll up when it rises and down when it falls, and the odometer counts from zero the first time it is scrolled into view. */
  value: number;
  /** Renders the value into the displayed string; digits become rolling columns, everything else becomes a static separator. @default String(Math.trunc(value)) */
  format?: (value: number) => string;
  /** Multiplies the simulation rate; sampled live on every frame. @default 1 */
  speed?: number;
  /** Extra class(es) merged onto the root. */
  className?: string;
  /** Inline styles merged onto the root. */
  style?: OdometerStyle;
}

export interface OdometerProps extends OdometerOwnProps {
  /** Standard <span> attributes (aria-*, data-*, title, ...) forwarded to the root. */
  htmlProps?: Omit<HTMLAttributes<HTMLSpanElement>, keyof OdometerOwnProps> & DataAttributes;
}

export function Odometer({ value, format, speed = 1, className = '', style, htmlProps }: OdometerProps) {
  const text = format ? format(value) : String(Math.trunc(value));
  const [head, core, tail] = parts(text);
  const zero = useMemo(() => parts(format ? format(0) : '0')[1].length, [format]);
  const [widest, setWidest] = useState(() => ''.padStart(zero, '0'));
  const grid = core.length > widest.length ? core : widest;
  if (grid !== widest) setWidest(grid);

  const rootRef = useRef<HTMLSpanElement>(null);
  const cols = useRef<Slot>([]);
  const strips = useRef<Slot>([]);
  const sim = useRef<Place[]>([]);
  const shown = useRef(0);
  const rate = useRef(speed);
  rate.current = speed;

  useEffect(() => {
    const motion = motionFor(rootRef.current);
    const dir = value < shown.current ? -1 : 1;
    shown.current = value;
    aim(sim.current, grid, core, zero, Math.max(motion.dur.slower, MIN_ROLL), dir);
    if (motion.reduced) snap(sim.current, cols.current, strips.current);
  }, [value, core, grid, zero]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const playback = loop((_k, dt) => step(sim.current, cols.current, strips.current, dt / 1000), {
      el,
      speed: () => rate.current,
      snap: () => snap(sim.current, cols.current, strips.current),
    });
    return () => playback.stop();
  }, []);

  return (
    <span ref={rootRef} className={cx('zc-odometer', className)} style={style} {...htmlProps}>
      <span className="zc-odometer__label">{text}</span>
      {affix(head)}
      {Array.from({ length: grid.length }, (_, n) => {
        const i = grid.length - 1 - n;
        const char = charAt(core, i) || charAt(grid, i);
        const lead = i >= zero || undefined;
        const col = (el: HTMLElement | null) => {
          cols.current[i] = el;
        };
        if (!DIGIT.test(char))
          return (
            <span key={i} ref={col} className="zc-odometer__separator" data-lead={lead} aria-hidden="true">
              {char}
            </span>
          );
        return (
          <span key={i} ref={col} className="zc-odometer__col" data-lead={lead} aria-hidden="true">
            <span
              className="zc-odometer__strip"
              ref={(el) => {
                strips.current[i] = el;
              }}
            >
              {CELLS.map((cell, c) => (
                <span key={c} className="zc-odometer__cell">
                  {cell}
                </span>
              ))}
            </span>
          </span>
        );
      })}
      {affix(tail)}
    </span>
  );
}
