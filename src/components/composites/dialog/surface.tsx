'use client';

import { useRef, type HTMLAttributes, type ReactNode } from 'react';

import type { DataAttributes } from '../../../dom-props';
import { useScrollEdges } from '../../internal/hooks/use-scroll-edges';
import { Icon } from '../../internal/icon/Icon';
import { IconSlot } from '../../internal/icon/IconSlot';
import { cx } from '../../internal/utils/cx';

interface DialogSurfaceProps {
  panelId: string;
  size?: 'sm' | 'md' | 'lg';
  tone?: 'default' | 'danger';
  icon?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  dismissible: boolean;
  footer?: ReactNode | ((close: () => void) => ReactNode);
  requestClose: () => void;
  htmlProps?: HTMLAttributes<HTMLElement> & DataAttributes;
  children?: ReactNode;
}

export function DialogSurface({
  panelId,
  size = 'md',
  tone = 'default',
  icon,
  title,
  description,
  dismissible,
  footer,
  requestClose,
  htmlProps,
  children,
}: DialogSurfaceProps) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const titleId = panelId + '-title';
  const descId = panelId + '-desc';
  const footerContent = typeof footer === 'function' ? footer(requestClose) : footer;

  useScrollEdges(bodyRef, (edges, el) => {
    el.toggleAttribute('data-scroll-top', edges.top);
    el.toggleAttribute('data-scroll-bottom', edges.bottom);
  });

  return (
    <section
      {...htmlProps}
      className={cx('zc-dialog', htmlProps?.className)}
      role="dialog"
      aria-modal="true"
      data-size={size === 'md' ? undefined : size}
      data-tone={tone === 'default' ? undefined : tone}
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={description ? descId : undefined}
    >
      {(icon || title || description || dismissible) && (
        <header className="zc-dialog__header">
          {icon && (
            <span className="zc-dialog__icon">
              <IconSlot size="md">{icon}</IconSlot>
            </span>
          )}
          <div className="zc-dialog__heading">
            {title && (
              <h2 className="zc-dialog__title" id={titleId}>
                {title}
              </h2>
            )}
            {description && (
              <p className="zc-dialog__desc" id={descId}>
                {description}
              </p>
            )}
          </div>
          {dismissible && (
            <button type="button" className="zc-dialog__close" aria-label="Close dialog" onClick={requestClose}>
              <Icon name="x" size="sm" weight="bold" />
            </button>
          )}
        </header>
      )}

      <div className="zc-dialog__body" ref={bodyRef}>
        {children}
      </div>

      {footerContent && <footer className="zc-dialog__footer">{footerContent}</footer>}
    </section>
  );
}
