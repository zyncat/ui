'use client';

import './toggle.css';

import { Fragment, type InputHTMLAttributes } from 'react';

export interface SwitchGlyphProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  pressed?: boolean;
}

export function SwitchGlyph({ pressed = false, ...inputProps }: SwitchGlyphProps) {
  return (
    <Fragment>
      <input type="checkbox" role="switch" className="zc-sw__input" {...inputProps} />
      <span
        className="zc-sw__track"
        data-on={inputProps.checked ? 'true' : undefined}
        data-pressed={pressed ? 'true' : undefined}
        aria-hidden="true"
      >
        <span className="zc-sw__thumb"></span>
      </span>
    </Fragment>
  );
}
