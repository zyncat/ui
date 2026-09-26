type Read = () => (() => void) | undefined;

const stops: (() => void)[] = [];
const reads: Read[] = [];

export function beforePaint(read: Read, stop?: () => void): void {
  if (!reads.length) queueMicrotask(flushBeforePaint);
  reads.push(read);
  if (stop) stops.push(stop);
}

export function flushBeforePaint(): void {
  for (const stop of stops.splice(0)) stop();
  for (const write of reads.splice(0).map((read) => read())) write?.();
}
