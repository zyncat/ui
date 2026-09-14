# Badge - @zyncat/ui/badge

Group: primitives
Docs: https://ui.zyncat.app/badge

Soft, glass or outline chip for ambient status - a label, a status or a count.

One content prop: `value`. Change it and the chip animates itself - a number rolls its digits like an
odometer and sets mono and tabular, text re-letters in place with the chip resizing to fit. `animate`
names the animation when the type is not the whole story: `roll` for a pre-formatted figure like
"1,024", `morph` to re-letter a number, `none` for a plain swap. `glint` sweeps a sheen across the
chip on every change - render it conditionally for the state that has landed. There is no status
vocabulary: your states, your wording, your tone mapping.

tone neutral|info|success|warning|danger, dot, live, variant soft|glass|outline, pill, size="sm".

```tsx
<Badge value="Published" tone="success" dot />
<Badge value={12} tone="info" />
<Badge value="1,024" animate="roll" pill />
```
