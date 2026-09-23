'use client';

import { useState } from 'react';
import { Pause, SkipBack, SkipForward } from '@phosphor-icons/react';

import { Motion } from '@zyncat/ui/motion';

import './island.css';

import { Playground } from '../../playground';
import { useLayoutKnobs } from './knobs';

const BARS = [45, 90, 60, 80];

const CODE = `<Motion
  key={expanded ? 'player' : 'pill'}
  as="button"
  layoutId="island"
  layoutTransition={{ crossfade: true }}
  onClick={() => setExpanded(!expanded)}
>
  {expanded ? <Player /> : <Pill />}
</Motion>`;

export function IslandDemo() {
  const { tuning, rail } = useLayoutKnobs(true);
  const [expanded, setExpanded] = useState(false);

  return (
    <Playground
      code={CODE}
      rail={rail}
      note="A pill opens into a player card. The corner radius and the content both change, with a different node on each side."
    >
      <div className="ml-phone">
        <Motion
          key={expanded ? 'player' : 'pill'}
          as="button"
          type="button"
          layoutId="ml-island"
          layoutTransition={tuning}
          className={expanded ? 'ml-island ml-island--open' : 'ml-island'}
          aria-expanded={expanded}
          aria-label={expanded ? 'Collapse the player' : 'Expand the player'}
          onClick={() => setExpanded(!expanded)}
        >
          <span className="ml-island__art" />
          {expanded ? (
            <>
              <span className="ml-island__track">
                <strong>Midnight City</strong>
                M83
              </span>
              <span className="ml-island__progress" />
              <span className="ml-island__controls">
                <SkipBack weight="fill" />
                <Pause weight="fill" />
                <SkipForward weight="fill" />
              </span>
            </>
          ) : (
            <span className="ml-island__bars">
              {BARS.map((height) => (
                <span key={height} style={{ height: `${height}%` }} />
              ))}
            </span>
          )}
        </Motion>
      </div>
    </Playground>
  );
}
