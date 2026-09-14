# Odometer - @zyncat/ui/odometer

Group: expressive
Docs: https://ui.zyncat.app/odometer

Rolling number display for display-size figures - each digit column springs on its own.

Each digit column carries its own spring, so digits arrive out of sync and blur in proportion to
their velocity; a travelling digit tints toward the accent. Expressive tier - retune it through
--odometer-* on the root: cell, digit, gap, ink, accent, separator-ink, size, weight. Pick it over a
numeric Badge for display-size figures. value is the number; format renders it to a string, where
digits become rolling columns and everything else becomes a static separator. speed is sampled live
every frame. Reduced motion snaps to the value without rolling.

```tsx
<Odometer value={12480} format={(v) => v.toLocaleString('en-US')} speed={1.2} />
```
