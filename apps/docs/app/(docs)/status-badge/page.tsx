import type { Metadata } from 'next';

import { Moved } from '@/components/Moved';
import { canonical } from '@/lib/site';

const TARGET = '/badge';

export const metadata: Metadata = {
  title: 'StatusBadge',
  description: 'StatusBadge is now Badge with a status value, on the Badge page.',
  alternates: { canonical: canonical('badge') },
};

export default function StatusBadgeMoved() {
  return <Moved to={TARGET} label="StatusBadge" />;
}
