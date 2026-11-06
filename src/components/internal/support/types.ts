import type { ReactNode } from 'react';

export interface SupportAction {
  /** Stable identity. Handed back to `onSelect` and used as the React key. */
  id: string;
  /** The visible name - "Live chat", "Book a call". */
  label: string;
  /** Leading glyph. Any node; the widget sizes the box it sits in. */
  icon?: ReactNode;
  /** Trailing metadata - a wait time, a slot, a ticket number. Set in tabular figures. */
  meta?: string;
  /** Second line under the label. The rail shows it; the fan puts it in the caption. */
  description?: string;
  /** Fires when this action commits, before the widget's own `onSelect`. */
  onSelect?: () => void;
}
