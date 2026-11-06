import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

import type { DataAttributes } from '../../../dom-props';
import type { ActivateOn } from '../../internal/utils/activation';

/** One tab in the row. */
export interface TabItem {
  /** Stable identity - also used in the tab/panel id pair. */
  value: string;
  /** Visible tab text. */
  label: ReactNode;
  /** Leading icon - your own node. */
  icon?: ReactNode;
  /** Rendered with tabular figures. Pass a number or a preformatted string. */
  count?: number | string;
  /** Dims the tab, blocks selection, and skips it during arrow-key travel. */
  disabled?: boolean;
}

interface TabsOwnProps {
  /** The tab row, in order. @default [] */
  items: TabItem[];
  /** Controlled - the value of the active tab (null/undefined hides the ink). */
  value: string | null | undefined;
  /** Fires on click and on arrow-key travel. `dir` is the direction of travel (+1 right, -1 left);
   *  hand it to TabPanel so content enters from that side. */
  onChange?: (value: string, dir: 1 | -1) => void;
  /** Shared id prefix wiring tab and panel aria. Give Tabs and its TabPanel the same `name`;
   *  omit it when the tabs have no managed panel. */
  name?: string;
  /** Accessible name for the tablist (e.g. "Section views"). */
  ariaLabel?: string;
  /** Whether a tab switches on `pointerdown` (snappier) or waits for `click`. @default 'pointerdown' */
  activateOn?: ActivateOn;
  /** Skin: an underline that reaches across (default), or a segmented pill riding an inset track. */
  variant?: 'underline' | 'pill';
  /** Tab height, type and padding. `'md'` and `'lg'` match `Button`'s steps; the default row sits
   *  just under them. @default 'sm' */
  size?: 'sm' | 'md' | 'lg';
  /** Stretch the row to its container and split it evenly between the tabs. */
  fill?: boolean;
  /** Extra class(es) merged onto the root. */
  className?: string;
  /** Inline styles merged onto the root. */
  style?: CSSProperties;
}

export interface TabsProps extends TabsOwnProps {
  /** Standard <div> attributes (data-*, aria-*, ...) forwarded to the root. */
  htmlProps?: Omit<HTMLAttributes<HTMLDivElement>, keyof TabsOwnProps> & DataAttributes;
}
