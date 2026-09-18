'use client';

import './textarea.css';

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  type ChangeEventHandler,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react';

import type { DataAttributes } from '../../../dom-props';
import { cx } from '../../internal/utils/cx';
import { Collapse } from '../collapse/Collapse';
import {
  FieldLabel,
  FieldMessage,
  fieldMessageId,
  joinIds,
  resolveFieldMessage,
  type FieldMessagingProps,
} from '../input/field-chrome';
import { CharMeter } from './char-meter';

type TextareaNative = Pick<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  'placeholder' | 'disabled' | 'readOnly' | 'onKeyDown'
>;

interface TextareaOwnProps extends FieldMessagingProps, TextareaNative {
  /** Controlled text value. @default '' */
  value?: string;
  /** Change handler - fired on each edit with the textarea change event. */
  onChange?: ChangeEventHandler<HTMLTextAreaElement>;
  /** Fired on ⌘/Ctrl+Enter with the current text. */
  onSubmit?: (value: string) => void;
  /** Soft char limit: shows the meter + over-limit highlight. Does NOT truncate (use native maxLength for a hard stop). */
  max?: number;
  /** Rows shown before auto-grow kicks in. @default 3 */
  minRows?: number;
  /** Row cap - grows up to this, then the box scrolls. @default 10 */
  maxRows?: number;
  /** Remaining-chars threshold that flips the meter amber. Default 20. */
  warnAt?: number;
  /** Footer hint, left of the meter - e.g. a ⌘↵ affordance. */
  hint?: ReactNode;
  /** md (default) - lg (prominent composer). */
  size?: 'md' | 'lg';
  /** Extra class(es) merged onto the field root. */
  className?: string;
  /** Inline styles merged onto the field root. */
  style?: CSSProperties;
}

export interface TextareaProps extends TextareaOwnProps {
  /** Standard <textarea> attributes (name, maxLength, aria-*, onKeyDown, ...) forwarded to the textarea. */
  htmlProps?: Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, keyof TextareaOwnProps | 'rows'> & DataAttributes;
}

export function Textarea({
  id,
  label,
  required,
  optional,
  placeholder,
  helper,
  error,
  warning,
  success,
  value = '',
  onChange,
  onKeyDown,
  onSubmit,
  max,
  minRows = 3,
  maxRows = 10,
  warnAt = 20,
  hint,
  size,
  disabled,
  readOnly,
  className = '',
  style,
  htmlProps,
}: TextareaProps) {
  const taRef = useRef<HTMLTextAreaElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const mirrorRef = useRef<HTMLDivElement>(null);
  const text = value ?? '';
  const count = text.length;
  const over = max ? Math.max(count - max, 0) : 0;
  const lastMax = useRef(max);
  if (max) lastMax.current = max;
  const meterMax = max ?? lastMax.current;

  const { state, msg, msgIcon } = resolveFieldMessage(error, warning, success, helper);
  const autoId = useId();
  const msgId = fieldMessageId(id ?? autoId, msg);

  const resize = () => {
    const el = taRef.current,
      stack = stackRef.current;
    if (!el || !stack) return;
    const start = stack.offsetHeight;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
    const content = el.offsetHeight;
    const maxPx = parseFloat(getComputedStyle(stack).maxHeight) || Infinity;
    const target = Math.min(content, maxPx);
    stack.style.overflowY = content > maxPx ? 'auto' : 'clip';
    if (target === start) return;
    stack.style.height = start + 'px';
    void stack.offsetHeight;
    stack.style.height = target + 'px';
  };
  useLayoutEffect(resize, [text, size]);
  useEffect(() => {
    const stack = stackRef.current;
    if (!stack) return undefined;
    let w = stack.offsetWidth;
    const ro = new ResizeObserver(() => {
      if (stack.offsetWidth !== w) {
        w = stack.offsetWidth;
        resize();
      }
    });
    ro.observe(stack);
    return () => ro.disconnect();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (onSubmit && (e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      onSubmit(text);
    }
    onKeyDown?.(e);
  };

  const cls = cx('zc-fld', 'zc-fld--txa', size === 'lg' && 'zc-fld--lg', state, className);
  const boxCls = cx('zc-txa', disabled && 'zc-is-disabled', readOnly && 'zc-is-readonly');

  return (
    <div className={cls} style={style}>
      <FieldLabel id={id} label={label} required={required} optional={optional} />
      <div className={boxCls} style={{ '--txa-min-rows': minRows, '--txa-max-rows': maxRows } as CSSProperties}>
        <div className="zc-txa__stack" ref={stackRef}>
          <div className="zc-txa__mirror" ref={mirrorRef} aria-hidden="true">
            {over ? text.slice(0, max) : text}
            {over ? <mark>{text.slice(max)}</mark> : null}
            {'\n'}
          </div>
          <textarea
            id={id}
            className="zc-txa__input"
            ref={taRef}
            rows={minRows}
            value={text}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            readOnly={readOnly}
            onChange={onChange}
            onKeyDown={handleKeyDown}
            onScroll={() => {
              if (mirrorRef.current) mirrorRef.current.scrollTop = taRef.current.scrollTop;
            }}
            aria-invalid={error ? true : undefined}
            {...htmlProps}
            aria-describedby={joinIds(msgId, htmlProps?.['aria-describedby'])}
          />
        </div>
        <Collapse open={!!(max || hint)}>
          <div className="zc-txa__bar">
            {hint && <span className="zc-txa__hint">{hint}</span>}
            <Collapse open={!!max} axis="width" fade className="zc-txa__meter-slot">
              {meterMax ? <CharMeter count={count} max={meterMax} warnAt={warnAt} /> : null}
            </Collapse>
          </div>
        </Collapse>
      </div>
      <FieldMessage id={msgId} message={msg} icon={msgIcon} />
    </div>
  );
}
