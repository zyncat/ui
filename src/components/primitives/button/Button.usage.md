# Button - @zyncat/ui/button

Group: primitives
Docs: https://ui.zyncat.app/button

One control for every click; exactly one primary per view.

variant primary|secondary|ghost|danger|link, size xs|sm|md|lg|xl, iconOnly, loading, disabled. Icons
are plain children - Button lays them out in a centered row with gap and sizes an svg to the size's
glyph, no iconLeft/iconRight slots.

```tsx
<Button variant="primary"><PlusIcon />Schedule post</Button>
<Button size="sm" iconOnly aria-label="Close"><XIcon /></Button>
```
