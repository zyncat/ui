import alert from './alert';
import avatar from './avatar';
import badge from './badge';
import button from './button';
import checkbox from './checkbox';
import collapse from './collapse';
import confetti from './confetti';
import dateField from './date-field';
import dateRange from './date-range';
import datetimeField from './datetime-field';
import emojiPicker from './emoji-picker';
import facebookFeed from './facebook-feed';
import flowField from './flow-field';
import icon from './icon';
import instagramFeed from './instagram-feed';
import installation from './installation';
import introduction from './introduction';
import lens from './lens';
import mcp from './mcp';
import morphingText from './morphing-text';
import multiSelect from './multi-select';
import numberField from './number-field';
import odometer from './odometer';
import otpField from './otp-field';
import pagination from './pagination';
import popover from './popover';
import radioGroup from './radio-group';
import select from './select';
import sheet from './sheet';
import supportRail from './support-rail';
import table from './table';
import tag from './tag';
import textField from './text-field';
import textarea from './textarea';
import theming from './theming';
import tiktok from './tiktok';
import timeField from './time-field';
import toggle from './toggle';
import type { PageSeo } from './types';
import typingLines from './typing-lines';
import weightField from './weight-field';
import youtube from './youtube';

export const SEO: Record<string, PageSeo> = {
  alert,
  avatar,
  badge,
  button,
  checkbox,
  collapse,
  confetti,
  'date-field': dateField,
  'date-range': dateRange,
  'datetime-field': datetimeField,
  'emoji-picker': emojiPicker,
  'facebook-feed': facebookFeed,
  'flow-field': flowField,
  icon,
  'instagram-feed': instagramFeed,
  installation,
  introduction,
  lens,
  mcp,
  'morphing-text': morphingText,
  'multi-select': multiSelect,
  'number-field': numberField,
  odometer,
  'otp-field': otpField,
  pagination,
  popover,
  'radio-group': radioGroup,
  select,
  sheet,
  'support-rail': supportRail,
  table,
  tag,
  'text-field': textField,
  textarea,
  theming,
  tiktok,
  'time-field': timeField,
  toggle,
  'typing-lines': typingLines,
  'weight-field': weightField,
  youtube,
};

export type { PageSeo, SeoFaq } from './types';
