'use client';

import { useState } from 'react';

import { Motion } from '@zyncat/ui/motion';

import './segmented.css';

import { Playground } from '../../playground';
import { useLayoutKnobs } from './knobs';

const RANGES = ['Day', 'Week', 'Month', 'Quarter', 'Year to date'];

const CODE = `<div role="group" aria-label="Date range" className="segmented">
  {ranges.map((range) => (
    <button key={range} aria-pressed={range === active} onClick={() => setActive(range)}>
      {range === active ? <Motion layoutId="range-pill" className="segmented__pill" /> : null}
      <span>{range}</span>
    </button>
  ))}
</div>`;

export function SegmentedDemo() {
  const { tuning, rail } = useLayoutKnobs(false);
  const [active, setActive] = useState(RANGES[1]);

  return (
    <Playground
      code={CODE}
      rail={rail}
      layout="under"
      note="The labels differ in width, so the pill resizes on every hop. Click fast to retarget it mid-flight."
    >
      <div className="ml-seg" role="group" aria-label="Date range">
        {RANGES.map((range) => (
          <button
            key={range}
            type="button"
            className="ml-seg__tab"
            aria-pressed={range === active}
            onClick={() => setActive(range)}
          >
            {range === active ? (
              <Motion layoutId="ml-seg-pill" layoutTransition={tuning} className="ml-seg__pill" />
            ) : null}
            <span className="ml-seg__label">{range}</span>
          </button>
        ))}
      </div>
    </Playground>
  );
}
