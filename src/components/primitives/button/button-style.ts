import './button.css';

import { cx } from '../../internal/utils/cx';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'link';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonStyleProps {
  /** Visual weight / intent. Omit for base chrome only - sizing, focus ring, layout -
   *  with no skin, for a local re-skin through `className`. */
  variant?: ButtonVariant;
  /** Control height: the `--control-height-*` step, so it lines up with a field of the same size.
   *  Type, padding and glyph step with it. `'icon'` is deprecated: it is `size="sm" iconOnly`.
   *  @default 'md' */
  size?: ButtonSize | 'icon';
  /** A square of the control height for one glyph. Name it with `aria-label`. @default false */
  iconOnly?: boolean;
  /** Stretch to fill the container width. */
  fullWidth?: boolean;
  /** Extra class(es) merged onto the result. */
  className?: string;
}

export function buttonClass({ variant, size = 'md', iconOnly, fullWidth, className }: ButtonStyleProps = {}): string {
  const step = size === 'icon' ? 'sm' : size;
  return cx(
    'zc-btn',
    variant && `zc-btn--${variant}`,
    step !== 'md' && `zc-btn--${step}`,
    (iconOnly || size === 'icon') && 'zc-btn--icon',
    fullWidth && 'zc-btn--block',
    className,
  );
}
