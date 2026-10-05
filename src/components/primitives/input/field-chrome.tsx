'use client';

import './input.css';

import type { ReactNode } from 'react';

import { Icon, type IconName } from '../../internal/icon/Icon';
import { Collapse } from '../collapse/Collapse';

export interface FieldIdProps {
  /** Field id, ties the label to the control. */
  id?: string;
}

export interface FieldRequirementProps {
  /** Mark the control required - reaches the native element and shows a danger `*` after the label. */
  required?: boolean;
  /** Show a muted "(optional)" after the label. */
  optional?: boolean;
}

export interface FieldCoreMessagingProps {
  /** Label text (sentence case). */
  label?: ReactNode;
  /** Neutral helper text - shown when there's no validation message. */
  helper?: ReactNode;
  /** Error message - sets the error state (border + icon + colour). Wins over warning/success/helper. */
  error?: ReactNode;
}

export interface FieldMessagingProps extends FieldIdProps, FieldRequirementProps, FieldCoreMessagingProps {
  /** Warning message - amber state. Loses to `error`; wins over `success`/`helper`. */
  warning?: ReactNode;
  /** Success message - green state. Loses to `error`/`warning`; wins over `helper`. */
  success?: ReactNode;
}

export interface FieldLabelProps extends FieldIdProps, FieldRequirementProps {
  /** Label text (sentence case). */
  label?: ReactNode;
  labelId?: string;
}

export function FieldLabel({ id, labelId, label, required, optional }: FieldLabelProps) {
  if (!label) return null;
  return (
    <label className="zc-fld__label" id={labelId} htmlFor={id}>
      {label}
      {required && (
        <span className="zc-fld__req" aria-hidden="true">
          *
        </span>
      )}
      {optional && <span className="zc-fld__optional">(optional)</span>}
    </label>
  );
}

export interface FieldMessageProps {
  id?: string;
  message?: ReactNode;
  icon?: IconName | null;
}

export function FieldMessage({ id, message, icon }: FieldMessageProps) {
  return (
    <Collapse open={!!message} className="zc-fld__msg-wrap">
      <div className="zc-fld__msg" id={id}>
        {icon && <Icon name={icon} size="sm" weight="fill" />}
        {message}
      </div>
    </Collapse>
  );
}

export const fieldMessageId = (baseId: string, message: ReactNode): string | undefined =>
  message ? baseId + '-msg' : undefined;

export const joinIds = (...ids: (string | undefined | null)[]): string | undefined =>
  ids.filter(Boolean).join(' ') || undefined;

export function resolveFieldMessage(
  error: ReactNode,
  warning: ReactNode,
  success: ReactNode,
  helper: ReactNode,
): { state: string; msg: ReactNode; msgIcon: IconName | null } {
  return {
    state: error ? 'zc-is-error' : warning ? 'zc-is-warning' : success ? 'zc-is-success' : '',
    msg: error || warning || success || helper,
    msgIcon: error ? 'warning-circle' : warning ? 'warning' : success ? 'check-circle' : null,
  };
}
