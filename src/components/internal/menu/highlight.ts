import type { DataAttributes } from '../../../dom-props';

export type MenuHighlight = 'neutral' | 'accent';

export type MenuSize = 'sm' | 'md' | 'lg';

export type MenuWeight = 'regular' | 'medium' | 'semibold';

export interface MenuHighlightProps {
  highlight?: MenuHighlight;
  rail?: boolean;
}

export interface MenuSurfaceProps extends MenuHighlightProps {
  size?: MenuSize;
  weight?: MenuWeight;
}

export function menuSurfaceAttrs({ highlight, rail, size, weight }: MenuSurfaceProps): DataAttributes {
  return {
    'data-highlight': highlight === 'accent' ? 'accent' : undefined,
    'data-rail': rail ? 'true' : undefined,
    'data-size': size ?? 'md',
    'data-weight': weight ?? 'medium',
  };
}
