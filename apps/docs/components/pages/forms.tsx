'use client';

import { useState } from 'react';

import { Button } from '@zyncat/ui/button';
import { Checkbox, type CheckboxProps } from '@zyncat/ui/checkbox';
import { MultiSelect, type MultiSelectProps } from '@zyncat/ui/multi-select';
import { NumberField, type NumberFieldProps } from '@zyncat/ui/number-field';
import { OtpField, type OtpFieldProps } from '@zyncat/ui/otp-field';
import { RadioGroup, type RadioGroupProps, type RadioOption } from '@zyncat/ui/radio-group';
import { Select, type SelectProps } from '@zyncat/ui/select';
import { TextField, type TextFieldProps } from '@zyncat/ui/text-field';
import { Textarea, type TextareaProps } from '@zyncat/ui/textarea';
import { toast } from '@zyncat/ui/toast';
import { Toggle, type ToggleProps } from '@zyncat/ui/toggle';

import { Icon } from '../icon';
import { KnobSegment, KnobSwitch, Playground } from '../playground';

type BoxSize = NonNullable<CheckboxProps['size']>;
type SwitchSize = NonNullable<ToggleProps['size']>;
type RadioVariant = NonNullable<RadioGroupProps['variant']>;
type RadioOrientation = NonNullable<RadioGroupProps['orientation']>;
type RadioSize = NonNullable<RadioGroupProps['size']>;
type NumberSize = NonNullable<NumberFieldProps['size']>;
type TextareaSize = NonNullable<TextareaProps['size']>;
type MultiSelectSize = NonNullable<MultiSelectProps['size']>;
type SelectHighlight = NonNullable<SelectProps['highlight']>;
type OtpSize = NonNullable<OtpFieldProps['size']>;
type TextFieldType = NonNullable<TextFieldProps['type']>;

const FIELD_SIZES: readonly FieldSize[] = ['sm', 'md', 'lg'];
const HIGHLIGHTS: readonly SelectHighlight[] = ['neutral', 'accent'];
const BOX_SIZES: readonly BoxSize[] = ['sm', 'md'];
const OTP_SIZES: readonly OtpSize[] = ['sm', 'md'];
const TEXTAREA_SIZES: readonly TextareaSize[] = ['sm', 'md', 'lg'];
const TEXT_FIELD_TYPES: readonly TextFieldType[] = ['text', 'search', 'email', 'url', 'password'];

const W = 320;

const SELECT_TRIGGER_CODE = `
  trigger={({ selected }) => (
    <Button variant="secondary">{selected ? selected.label : 'Choose timezone'}</Button>
  )}`;

const MULTI_TRIGGER_CODE = `
  trigger={({ selected }) => (
    <Button variant="secondary">{selected.length ? selected.length + ' channels' : 'Choose channels'}</Button>
  )}`;

type Option = { value: string; label: string; description?: string; icon?: string; disabled?: boolean };

const PLAN: RadioOption[] = [
  { value: 'starter', label: 'Starter', description: 'For individuals' },
  { value: 'pro', label: 'Pro', description: 'For small teams' },
  { value: 'scale', label: 'Scale', description: 'For organizations' },
];

const TIMEZONES: Option[] = [
  { value: 'utc', label: 'UTC (Coordinated Universal Time)' },
  { value: 'lon', label: 'London (GMT+1)' },
  { value: 'nyc', label: 'New York (GMT-4)' },
  { value: 'la', label: 'Los Angeles (GMT-7)' },
  { value: 'tok', label: 'Tokyo (GMT+9)' },
];

const CHANNELS: Option[] = [
  { value: 'tw', label: 'Twitter / X' },
  { value: 'ig', label: 'Instagram' },
  { value: 'li', label: 'LinkedIn' },
  { value: 'yt', label: 'YouTube' },
  { value: 'tt', label: 'TikTok' },
];

type FieldSize = NonNullable<TextFieldProps['size']>;
type FieldState = 'idle' | 'error' | 'warning' | 'success';

export function TextFieldPlayground() {
  const [size, setSize] = useState<FieldSize>('md');
  const [type, setType] = useState<TextFieldType>('text');
  const [state, setState] = useState<FieldState>('idle');
  const [clearable, setClearable] = useState(true);
  const [leadingIcon, setLeadingIcon] = useState(true);
  const [value, setValue] = useState('Quarterly review');

  const stateProps = {
    error: state === 'error' ? 'That name is already taken.' : undefined,
    warning: state === 'warning' ? 'Renaming breaks existing share links.' : undefined,
    success: state === 'success' ? 'Name is available.' : undefined,
  };

  const stateCode =
    state === 'idle' ? '' : `\n  ${state}="${stateProps.error ?? stateProps.warning ?? stateProps.success}"`;
  const code = `<TextField
  label="Project name"
  size="${size}"
  type="${type}"
  clearable={${clearable}}${leadingIcon ? '\n  leadingIcon={<SearchIcon />}' : ''}${stateCode}
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>`;

  return (
    <Playground
      code={code}
      note="State messages disclose through Collapse - they ease in, never jump the layout."
      rail={
        <>
          <KnobSegment label="size" value={size} onChange={setSize} options={FIELD_SIZES} />
          <KnobSegment label="type" value={type} onChange={setType} options={TEXT_FIELD_TYPES} />
          <KnobSegment
            label="state"
            value={state}
            onChange={setState}
            options={['idle', 'error', 'warning', 'success']}
          />
          <KnobSwitch label="clearable" checked={clearable} onChange={setClearable} />
          <KnobSwitch label="leading icon" checked={leadingIcon} onChange={setLeadingIcon} />
        </>
      }
    >
      <div style={{ width: '100%', maxWidth: W }}>
        <TextField
          id="tf-playground"
          label="Project name"
          size={size}
          type={type}
          clearable={clearable}
          leadingIcon={leadingIcon ? <Icon name="magnifying-glass" /> : undefined}
          helper={state === 'idle' ? 'Visible to everyone on your team.' : undefined}
          error={stateProps.error}
          warning={stateProps.warning}
          success={stateProps.success}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </div>
    </Playground>
  );
}

export function NumberFieldPlayground() {
  const [size, setSize] = useState<NumberSize>('md');
  const [seats, setSeats] = useState(5);

  const code = `<NumberField label="Seats" unit="users" size="${size}" min={1} max={50} value={seats} onChange={setSeats} />`;

  return (
    <Playground code={code} rail={<KnobSegment label="size" value={size} onChange={setSize} options={FIELD_SIZES} />}>
      <div style={{ width: '100%', maxWidth: W }}>
        <NumberField
          id="nf-playground"
          label="Seats"
          unit="users"
          size={size}
          min={1}
          max={50}
          value={seats}
          onChange={setSeats}
        />
      </div>
    </Playground>
  );
}

export function OtpFieldPlayground() {
  const [size, setSize] = useState<OtpSize>('md');
  const [value, setValue] = useState('492');

  const code = `<OtpField length={6} group={3} size="${size}" value={code} onChange={setCode} />`;

  return (
    <Playground
      code={code}
      note="Two steps - sm for a dense form, md for the standard code cell."
      rail={<KnobSegment label="size" value={size} onChange={setSize} options={OTP_SIZES} />}
    >
      <OtpField length={6} group={3} size={size} value={value} onChange={setValue} />
    </Playground>
  );
}

export function TextareaPlayground() {
  const [size, setSize] = useState<TextareaSize>('md');
  const [body, setBody] = useState('Launching our new React 19 design system today!');

  const code = `<Textarea
  label="Announcement draft"
  size="${size}"
  max={280}
  minRows={3}
  value={body}
  onChange={(e) => setBody(e.target.value)}
  onSubmit={submit}
  hint="Cmd+Enter to submit"
/>`;

  return (
    <Playground
      code={code}
      note="sm drops into a dense form row; lg is the prominent composer - taller rhythm, larger type."
      rail={<KnobSegment label="size" value={size} onChange={setSize} options={TEXTAREA_SIZES} />}
    >
      <div style={{ width: '100%', maxWidth: 440 }}>
        <Textarea
          id="ta-playground"
          label="Announcement draft"
          placeholder="Write your post..."
          size={size}
          max={280}
          minRows={3}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onSubmit={() => toast.success('Draft submitted')}
          hint="Cmd+Enter to submit"
        />
      </div>
    </Playground>
  );
}

export function CheckboxPlayground() {
  const [size, setSize] = useState<BoxSize>('md');
  const [checked, setChecked] = useState(true);

  const code = `<Checkbox
  label="Pin post to queue"
  description="Published before any other scheduled items."
  size="${size}"
  checked={checked}
  onChange={(e) => setChecked(e.target.checked)}
/>`;

  return (
    <Playground code={code} rail={<KnobSegment label="size" value={size} onChange={setSize} options={BOX_SIZES} />}>
      <Checkbox
        label="Pin post to queue"
        description="Published before any other scheduled items."
        size={size}
        checked={checked}
        onChange={(e) => setChecked(e.target.checked)}
      />
    </Playground>
  );
}

export function TogglePlayground() {
  const [size, setSize] = useState<SwitchSize>('md');
  const [toggled, setToggled] = useState(true);

  const code = `<Toggle
  label="Auto-save drafts"
  description="Changes sync automatically as you type."
  size="${size}"
  checked={toggled}
  onChange={(e) => setToggled(e.target.checked)}
/>`;

  return (
    <Playground code={code} rail={<KnobSegment label="size" value={size} onChange={setSize} options={BOX_SIZES} />}>
      <Toggle
        label="Auto-save drafts"
        description="Changes sync automatically as you type."
        size={size}
        checked={toggled}
        onChange={(e) => setToggled(e.target.checked)}
      />
    </Playground>
  );
}

export function RadioGroupPlayground() {
  const [variant, setVariant] = useState<RadioVariant>('cards');
  const [orientation, setOrientation] = useState<RadioOrientation>('vertical');
  const [size, setSize] = useState<RadioSize>('md');
  const [plan, setPlan] = useState('pro');

  const code = `<RadioGroup
  name="plan"
  label="Select a plan"
  variant="${variant}"
  orientation="${orientation}"
  size="${size}"
  value={plan}
  onChange={setPlan}
  options={PLAN_OPTIONS}
/>`;

  return (
    <Playground
      code={code}
      note="Cards carry the selection as a bordered fill that glides between them; rows glide the marker instead."
      rail={
        <>
          <KnobSegment label="variant" value={variant} onChange={setVariant} options={['rows', 'cards']} />
          <KnobSegment
            label="orientation"
            value={orientation}
            onChange={setOrientation}
            options={['vertical', 'horizontal']}
          />
          <KnobSegment label="size" value={size} onChange={setSize} options={BOX_SIZES} />
        </>
      }
    >
      <div style={{ width: '100%', maxWidth: orientation === 'horizontal' ? '100%' : 400 }}>
        <RadioGroup
          name="rg-playground"
          label="Select a plan"
          variant={variant}
          orientation={orientation}
          size={size}
          value={plan}
          onChange={setPlan}
          options={PLAN}
        />
      </div>
    </Playground>
  );
}

export function SelectPlayground() {
  const [size, setSize] = useState<FieldSize>('md');
  const [searchable, setSearchable] = useState(true);
  const [loading, setLoading] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [highlight, setHighlight] = useState<SelectHighlight>('neutral');
  const [rail, setRail] = useState(false);
  const [customTrigger, setCustomTrigger] = useState(false);
  const [tz, setTz] = useState<string | null>('nyc');

  const code = `<Select
  ariaLabel="Timezone"
  options={TIMEZONES}
  value={tz}
  onChange={setTz}
  size="${size}"
  searchable={${searchable}}
  loading={${loading}}
  invalid={${invalid}}
  disabled={${disabled}}
  highlight="${highlight}"
  rail={${rail}}${customTrigger ? SELECT_TRIGGER_CODE : ''}
/>`;

  return (
    <Playground
      code={code}
      note="Committing an option closes the menu and returns focus to the trigger."
      rail={
        <>
          <KnobSegment label="size" value={size} onChange={setSize} options={['sm', 'md', 'lg']} />
          <KnobSwitch label="searchable" checked={searchable} onChange={setSearchable} />
          <KnobSwitch label="loading" checked={loading} onChange={setLoading} />
          <KnobSwitch label="invalid" checked={invalid} onChange={setInvalid} />
          <KnobSwitch label="disabled" checked={disabled} onChange={setDisabled} />
          <KnobSegment label="highlight" value={highlight} onChange={setHighlight} options={HIGHLIGHTS} />
          <KnobSwitch label="rail" checked={rail} onChange={setRail} />
          <KnobSwitch label="custom trigger" checked={customTrigger} onChange={setCustomTrigger} />
        </>
      }
    >
      <div style={{ width: '100%', maxWidth: W, textAlign: 'center' }}>
        <Select
          ariaLabel="Timezone"
          placeholder="Choose timezone"
          value={tz}
          onChange={(v) => setTz(v)}
          options={TIMEZONES}
          size={size}
          searchable={searchable}
          loading={loading}
          invalid={invalid}
          disabled={disabled}
          highlight={highlight}
          rail={rail}
          trigger={
            customTrigger
              ? ({ selected }) => (
                  <Button variant="secondary" size={size}>
                    {selected ? selected.label : 'Choose timezone'}
                  </Button>
                )
              : undefined
          }
        />
      </div>
    </Playground>
  );
}

export function MultiSelectPlayground() {
  const [size, setSize] = useState<MultiSelectSize>('md');
  const [highlight, setHighlight] = useState<SelectHighlight>('neutral');
  const [rail, setRail] = useState(false);
  const [customTrigger, setCustomTrigger] = useState(false);
  const [channels, setChannels] = useState(['tw', 'li']);

  const code = `<MultiSelect
  ariaLabel="Connected channels"
  placeholder="Select channels..."
  size="${size}"
  value={channels}
  onChange={setChannels}
  options={CHANNELS}
  highlight="${highlight}"
  rail={${rail}}
  searchable${customTrigger ? MULTI_TRIGGER_CODE : ''}
/>`;

  return (
    <Playground
      code={code}
      rail={
        <>
          <KnobSegment label="size" value={size} onChange={setSize} options={FIELD_SIZES} />
          <KnobSegment label="highlight" value={highlight} onChange={setHighlight} options={HIGHLIGHTS} />
          <KnobSwitch label="rail" checked={rail} onChange={setRail} />
          <KnobSwitch label="custom trigger" checked={customTrigger} onChange={setCustomTrigger} />
        </>
      }
    >
      <div style={{ width: '100%', maxWidth: W, textAlign: 'center' }}>
        <MultiSelect
          ariaLabel="Connected channels"
          placeholder="Select channels..."
          size={size}
          value={channels}
          onChange={setChannels}
          options={CHANNELS}
          highlight={highlight}
          rail={rail}
          searchable
          trigger={
            customTrigger
              ? ({ selected }) => (
                  <Button variant="secondary" size={size}>
                    {selected.length ? selected.length + ' channels' : 'Choose channels'}
                  </Button>
                )
              : undefined
          }
        />
      </div>
    </Playground>
  );
}
