'use client';

import { useState } from 'react';

import type { FlipTuning } from '@zyncat/ui/motion';
import { UIMotion } from '@zyncat/ui/motion-tokens';

import { KnobSegment, KnobSwitch } from '../../playground';

const SIZES = ['scale', 'morph', 'none'] as const;
const TIMINGS = ['default', 'layout', 'glide', 'settle'] as const;

export function useLayoutKnobs(crossfadeAtStart?: boolean) {
  const [size, setSize] = useState<(typeof SIZES)[number]>('scale');
  const [timing, setTiming] = useState<(typeof TIMINGS)[number]>('default');
  const [crossfade, setCrossfade] = useState(crossfadeAtStart ?? false);

  const tuning: FlipTuning = { size, crossfade, timing: timing === 'default' ? undefined : UIMotion.t[timing] };
  const rail = (
    <>
      <KnobSegment label="Size" value={size} onChange={setSize} options={SIZES} />
      <KnobSegment label="Timing" value={timing} onChange={setTiming} options={TIMINGS} />
      {crossfadeAtStart === undefined ? null : (
        <KnobSwitch label="Crossfade" checked={crossfade} onChange={setCrossfade} />
      )}
    </>
  );

  return { tuning, rail };
}
