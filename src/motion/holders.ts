import { measure, type Box } from '../engine';
import { sharedSlot } from '../shared-slot';

export const sharedOwner = sharedSlot('motion.flip-owner@1', () => new Map<string, HTMLElement>());
export const leaving = sharedSlot('motion.flip-leaving@1', () => new Map<HTMLElement, Box>());

export function measureHolders(): void {
  if (leaving.size || !sharedOwner.size) return;
  for (const holder of sharedOwner.values()) if (holder.isConnected) leaving.set(holder, measure(holder));
}
