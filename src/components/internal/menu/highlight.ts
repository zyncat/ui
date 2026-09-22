import type { DataAttributes } from '../../../dom-props';

export type MenuHighlight = 'neutral' | 'accent';

export type MenuSize = 'sm' | 'md' | 'lg';

export type MenuWeight = 'regular' | 'medium' | 'semibold';

export type MenuWidth = 'auto' | 'trigger' | 'sm' | 'md' | 'lg';

export interface MenuHighlightProps {
  highlight?: MenuHighlight;
  rail?: boolean;
}

export interface MenuSurfaceProps extends MenuHighlightProps {
  size?: MenuSize;
  weight?: MenuWeight;
  width?: MenuWidth;
}

export function menuSurfaceAttrs({ highlight, rail, size, weight, width }: MenuSurfaceProps): DataAttributes {
  return {
    'data-highlight': highlight === 'accent' ? 'accent' : undefined,
    'data-rail': rail ? 'true' : undefined,
    'data-size': size ?? 'md',
    'data-weight': weight ?? 'medium',
    'data-width': width ?? 'auto',
  };
}
