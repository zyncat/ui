import type { ComponentDoc } from './types';

export const forms: Record<string, ComponentDoc> = {
  'text-field': {
    example: `import { TextField } from '@zyncat/ui/text-field';

<TextField
  id="post-title"
  label="Post title"
  placeholder="Enter a title..."
  required
  value={title}
  onChange={(e) => setTitle(e.target.value)}
  clearable
  helper="Shown in the content calendar."
/>`,
  },

  'number-field': {
    example: `import { NumberField } from '@zyncat/ui/number-field';

<NumberField
  id="posts-per-day"
  label="Posts per day"
  unit="posts"
  min={1}
  max={20}
  step={1}
  value={postsPerDay}
  onChange={setPostsPerDay}
  helper="Maximum allowed by your plan."
/>`,
  },

  'otp-field': {
    example: `import { OtpField } from '@zyncat/ui/otp-field';

<OtpField
  length={6}
  group={3}
  value={code}
  onChange={setCode}
/>`,
  },

  textarea: {
    example: `import { Textarea } from '@zyncat/ui/textarea';

<Textarea
  id="post-body"
  label="Post content"
  placeholder="Write your post..."
  required
  max={280}
  minRows={3}
  value={body}
  onChange={(e) => setBody(e.target.value)}
  onSubmit={schedulePost}
  hint="Cmd+Enter to schedule"
/>`,
  },

  checkbox: {
    example: `import { Checkbox } from '@zyncat/ui/checkbox';

<Checkbox
  label="Pin to top of queue"
  description="Published before any other queued items."
  checked={pinned}
  onChange={(e) => setPinned(e.target.checked)}
/>`,
  },

  toggle: {
    example: `import { Toggle } from '@zyncat/ui/toggle';

<Toggle
  label="Auto-publish drafts"
  description="Scheduled drafts publish automatically at their queued time."
  checked={autoPublish}
  onChange={(e) => setAutoPublish(e.target.checked)}
/>`,
  },

  'radio-group': {
    example: `import { RadioGroup } from '@zyncat/ui/radio-group';

const CADENCE_OPTIONS = [
  { value: 'daily', label: 'Daily', description: 'One post per day.' },
  { value: 'weekly', label: 'Weekly', description: 'One post per week.' },
  { value: 'custom', label: 'Custom', description: 'Set your own interval.' },
];

<RadioGroup
  name="cadence"
  label="Posting cadence"
  value={cadence}
  onChange={setCadence}
  options={CADENCE_OPTIONS}
/>`,
  },

  select: {
    example: `import { Select } from '@zyncat/ui/select';

const TIMEZONE_OPTIONS = [
  { value: 'America/New_York', label: 'New York (ET)' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
];

<Select
  options={TIMEZONE_OPTIONS}
  value={timezone}
  onChange={(v) => setTimezone(v)}
  placeholder="Choose a time zone"
  searchable
  ariaLabel="Time zone"
/>`,
  },

  'multi-select': {
    example: `import { MultiSelect } from '@zyncat/ui/multi-select';

const CHANNEL_OPTIONS = [
  { value: 'twitter', label: 'Twitter / X' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'linkedin', label: 'LinkedIn' },
];

<MultiSelect
  options={CHANNEL_OPTIONS}
  value={channels}
  onChange={(v) => setChannels(v)}
  placeholder="Choose channels"
  searchable
  ariaLabel="Channels"
/>`,
  },

  combobox: {
    example: `import { Combobox } from '@zyncat/ui/combobox';
import { Textarea } from '@zyncat/ui/textarea';

const TEAMMATES = [
  { value: 'ana', label: 'Ana Ng', description: 'Design lead' },
  { value: 'marco', label: 'Marco Ruiz', description: 'Social media manager' },
  { value: 'priya', label: 'Priya Shah', description: 'Copywriter' },
];

<Combobox
  trigger="@"
  options={TEAMMATES}
  insert={(teammate) => '@' + teammate.value + ' '}
  onSelect={(handle) => addMention(handle)}
  ariaLabel="Mention a teammate"
>
  <Textarea
    id="post-comment"
    label="Comment"
    placeholder="Leave a note for the team..."
    value={comment}
    onChange={(e) => setComment(e.target.value)}
  />
</Combobox>`,
  },
};
