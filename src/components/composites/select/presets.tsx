'use client';

import '../../primitives/tag/tag.css';

import { useState, type KeyboardEvent } from 'react';

import type { MenuSize } from '../../internal/menu/highlight';
import { cx } from '../../internal/utils/cx';

export interface MultiSelectPreset {
  /** Chip text. */
  label: string;
  /** The selection a press applies, replacing the current one as given. */
  value: string[];
}

interface PresetRowProps {
  presets: MultiSelectPreset[];
  size: MenuSize;
  apply: (value: string[]) => void;
  onMenuKeyDown: (e: KeyboardEvent) => void;
}

export function PresetRow({ presets, size, apply, onMenuKeyDown }: PresetRowProps) {
  const [status, setStatus] = useState('');
  return (
    <div className="zc-select__presets" role="group" aria-label="Presets">
      {presets.map((preset) => (
        <button
          key={preset.label}
          type="button"
          className={cx('zc-tag zc-tag--toggle', size !== 'lg' && 'zc-tag--sm')}
          onKeyDown={(e) => (e.key === 'Escape' || e.key === 'Tab') && onMenuKeyDown(e)}
          onClick={() => {
            apply(preset.value);
            setStatus(preset.value.length + ' selected');
          }}
        >
          <span className="zc-tag__label">{preset.label}</span>
        </button>
      ))}
      <span className="zc-select__presets-status" role="status">
        {status}
      </span>
    </div>
  );
}
