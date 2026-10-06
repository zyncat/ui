export type TextControl = HTMLInputElement | HTMLTextAreaElement;

export interface QueryRange {
  start: number;
  end: number;
  text: string;
}

export function queryAt(field: TextControl, trigger: string | undefined): QueryRange | null {
  const { value, selectionStart: caret, selectionEnd } = field;
  if (!trigger) return { start: 0, end: value.length, text: value };
  if (caret !== selectionEnd || caret < trigger.length) return null;
  const start = value.lastIndexOf(trigger, caret - trigger.length);
  const text = value.slice(start + trigger.length, caret);
  if (start < 0 || /\s/.test(text) || /\S/.test(value[start - 1] ?? ' ')) return null;
  return { start, end: caret, text };
}

export function caretRect(field: TextControl, index: number): DOMRect {
  const box = field.getBoundingClientRect();
  const style = getComputedStyle(field);
  const multiline = field instanceof HTMLTextAreaElement;
  const mirror = document.createElement('div');
  for (const name of style) mirror.style.setProperty(name, style.getPropertyValue(name));
  Object.assign(mirror.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    visibility: 'hidden',
    whiteSpace: multiline ? 'pre-wrap' : 'pre',
  });
  const marker = document.createElement('span');
  marker.textContent = field.value[index] || '​';
  mirror.append(field.value.slice(0, index), marker, field.value.slice(index + 1));
  document.body.append(mirror);
  const line = parseFloat(style.lineHeight) || marker.offsetHeight;
  const left = box.left + field.clientLeft + marker.offsetLeft - field.scrollLeft;
  const top = box.top + field.clientTop + marker.offsetTop - field.scrollTop - (line - marker.offsetHeight) / 2;
  mirror.remove();
  return multiline ? new DOMRect(left, top, 0, line) : new DOMRect(left, box.top, 0, box.height);
}
