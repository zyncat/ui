'use client';

import './tag.css';

import { createContext, useContext, type CSSProperties, type HTMLAttributes, type ReactNode, type Ref } from 'react';

import type { DataAttributes } from '../../../dom-props';
import type { Layer } from '../../../engine';
import { Motion } from '../../../motion/element';
import type { FlipTuning } from '../../../motion/flip';
import { resolveMotionTiming } from '../../../motion/motion-timing';
import { Presence } from '../../../motion/presence';
import { popIn, popOut } from '../../../motion/presets';
import type { DisableableAnimation } from '../../../motion/timing';
import { UIMotion } from '../../../tokens/motion-tokens';
import { IconSlot } from '../../internal/icon/IconSlot';
import { cx } from '../../internal/utils/cx';

const TAG_TIMING = { open: { duration: 'base', ease: 'entrance' }, close: { duration: 'fast', ease: 'exit' } } as const;
const TAG_LAYOUT_TIMING = {
  open: { duration: 'slow', ease: 'entrance' },
  close: { duration: 'slow', ease: 'entrance' },
} as const;

interface TagGroupMotion {
  animate: Layer;
  exit: Layer;
  layout: FlipTuning;
}

const TagGroupContext = createContext<TagGroupMotion | null>(null);

interface TagOwnProps {
  /** Tag content; a string label also seeds the default remove-button `aria-label`. */
  children: ReactNode;
  /** Your own icon node, sized small and tinted to the tag's text. */
  icon?: ReactNode | null;
  /** Presence adds the remove button; called on click - remove the item yourself. */
  onRemove?: (() => void) | null;
  /** Accessible label for the remove button. Defaults to "Remove {label}" for string labels. */
  removeLabel?: string;
  /** 'md' sits on `--control-height-sm`; 'sm' is 24px, for dense rows. @default 'md' */
  size?: 'md' | 'sm';
  /** Set `data-disabled` on the tag and disable its remove button. @default false */
  disabled?: boolean;
  /** Extra class(es) merged onto the root element. */
  className?: string;
  /** Inline styles merged onto the root element. */
  style?: CSSProperties;
}

/** Tag - the removable, editable label (stateless; the parent owns the list). */
export interface TagProps extends TagOwnProps {
  /** Standard <span> attributes forwarded to the tag root. */
  htmlProps?: Omit<HTMLAttributes<HTMLSpanElement>, keyof TagOwnProps> & DataAttributes;
  /** Ref to the tag root span. */
  ref?: Ref<HTMLSpanElement>;
}

interface TagGroupOwnProps {
  /** Accessible name for the group (role="group"). */
  ariaLabel?: string;
  /** The `Tag`s; adds, removals and reflow are animated. */
  children?: ReactNode;
  /** Extra class(es) merged onto the group wrapper. */
  className?: string;
  /** Inline styles merged onto the group wrapper. */
  style?: CSSProperties;
  /** Add/remove/reflow timing for the member tags - motion tokens only, or `null` to disable. */
  animation?: DisableableAnimation;
}

/** TagGroup - wrapping flex row + removal/insertion choreography. */
export interface TagGroupProps extends TagGroupOwnProps {
  /** Standard <div> attributes forwarded to the group wrapper. */
  htmlProps?: Omit<HTMLAttributes<HTMLDivElement>, keyof TagGroupOwnProps> & DataAttributes;
}

function TagRemoveGlyph() {
  return (
    <svg viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M3 3 L9 9 M9 3 L3 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function Tag({
  children,
  icon = null,
  onRemove = null,
  removeLabel,
  size = 'md',
  disabled = false,
  className = '',
  style,
  htmlProps,
  ref,
}: TagProps) {
  const cls = cx('zc-tag', size === 'sm' && 'zc-tag--sm', className);
  const xLabel = removeLabel || (typeof children === 'string' ? 'Remove ' + children : 'Remove');
  const group = useContext(TagGroupContext);

  return (
    <Motion
      as="span"
      ref={ref}
      animate={group?.animate}
      exit={group?.exit}
      layout={!!group}
      layoutTransition={group?.layout}
      className={cls}
      style={style}
      data-disabled={disabled ? 'true' : undefined}
      {...htmlProps}
    >
      {icon && (
        <span className="zc-tag__icon">
          <IconSlot size="sm">{icon}</IconSlot>
        </span>
      )}
      <span className="zc-tag__label">{children}</span>
      {onRemove && (
        <button type="button" className="zc-tag__remove" aria-label={xLabel} disabled={disabled} onClick={onRemove}>
          <TagRemoveGlyph />
        </button>
      )}
    </Motion>
  );
}

export function TagGroup({ ariaLabel, className = '', style, children, htmlProps, animation }: TagGroupProps) {
  const step = resolveMotionTiming(animation, TAG_TIMING);
  const layout = resolveMotionTiming(animation, TAG_LAYOUT_TIMING).open;

  const motion = {
    animate: popIn(UIMotion.scale.chip, step.open),
    exit: popOut(UIMotion.scale.chip, step.close),
    layout: { timing: layout },
  };

  return (
    <div className={cx('zc-tag-group', className)} style={style} role="group" aria-label={ariaLabel} {...htmlProps}>
      <TagGroupContext.Provider value={motion}>
        <Presence initial={false}>{children}</Presence>
      </TagGroupContext.Provider>
    </div>
  );
}
