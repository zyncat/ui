'use client';

import { useEffect, useRef } from 'react';

import { loop } from '../../../engine';
import { UIMotion } from '../../../tokens/motion-tokens';
import { bindInput } from './input';
import { advance, atRest, clamp, cloneInto, createOptics, measure, settle, type Parts } from './optics';
import { paint } from './paint';

const RADIUS_MIN = 60;
const RADIUS_MAX = 260;
const MAGNIFICATION_MIN = 1.2;
const MAGNIFICATION_MAX = 6;
const RECLONE_INTERVAL_MS = 90;

export function useLens(magnification: number, radius: number, chromatic: boolean) {
  const stageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const glassRef = useRef<HTMLDivElement>(null);
  const coreRef = useRef<HTMLDivElement>(null);
  const rimRef = useRef<HTMLDivElement>(null);
  const fringeRef = useRef<HTMLDivElement>(null);
  const specularRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const settings = useRef({ magnification, radius, chromatic });

  useEffect(() => {
    settings.current = { magnification, radius, chromatic };
  }, [magnification, radius, chromatic]);

  useEffect(() => {
    const parts: Parts | null =
      stageRef.current &&
      contentRef.current &&
      glassRef.current &&
      coreRef.current &&
      rimRef.current &&
      fringeRef.current &&
      specularRef.current &&
      ringRef.current
        ? {
            stage: stageRef.current,
            content: contentRef.current,
            glass: glassRef.current,
            core: coreRef.current,
            rim: rimRef.current,
            fringe: fringeRef.current,
            specular: specularRef.current,
            ring: ringRef.current,
          }
        : null;
    if (!parts) return;

    const optics = createOptics();
    const reduced = UIMotion.reduced;
    const currentRadius = () => clamp(settings.current.radius, RADIUS_MIN, RADIUS_MAX);
    const currentMagnification = () => clamp(settings.current.magnification, MAGNIFICATION_MIN, MAGNIFICATION_MAX);

    const rebuild = () => {
      const box = parts.content.getBoundingClientRect();
      cloneInto(parts.core, parts.content, box.width, box.height);
      cloneInto(parts.rim, parts.content, box.width, box.height);
      measure(parts, optics);
    };

    const render = () => paint(parts, optics, currentRadius(), settings.current.chromatic);

    const settleNow = () => {
      settle(optics, currentMagnification());
      render();
    };

    const wake = () => (reduced ? settleNow() : playback.wake());

    rebuild();

    const mutations = new MutationObserver(() => {
      optics.dirty = true;
      if (reduced) rebuild();
      wake();
    });
    mutations.observe(parts.content, { childList: true, subtree: true, characterData: true, attributes: true });

    const resizes = new ResizeObserver(() => {
      measure(parts, optics);
      wake();
    });
    resizes.observe(parts.content);

    const controller = new AbortController();
    bindInput(parts, optics, wake, controller.signal);

    const playback = loop(
      (k, dt) => {
        optics.sinceClone += dt;
        if (optics.dirty && optics.sinceClone > RECLONE_INTERVAL_MS) {
          optics.dirty = false;
          optics.sinceClone = 0;
          rebuild();
        }
        advance(optics, k, currentMagnification());
        if (atRest(optics)) {
          settleNow();
          return false;
        }
        render();
      },
      { el: parts.stage, snap: render },
    );

    return () => {
      playback.stop();
      mutations.disconnect();
      resizes.disconnect();
      controller.abort();
    };
  }, []);

  return { stageRef, contentRef, glassRef, coreRef, rimRef, fringeRef, specularRef, ringRef };
}
