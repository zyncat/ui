# ScrollArea - @zyncat/ui/scroll-area

Group: data-display
Docs: https://ui.zyncat.app/scroll-area

One-axis scroller with no scrollbar: an edge fades only while content hides past it, and an x rail pages from its edges - keep overflow: auto for a visible bar or two axes.

axis y|x, variant fade|depth, fill (x only), ariaLabel, activateOn pointerdown|click, and ref to the
element that scrolls. The fades follow resizes and added items on their own. A y scroller needs a
bounded height - height or max-height on style or className, or flex: 1 inside a bounded flex column,
since the root already carries min-height: 0.
An x rail shows a door on each faded edge while a fine pointer hovers it; each pages by the viewport
less both fades, so nothing under a fade is skipped, and scrolls smoothly unless reduced motion is
on. The doors are aria-hidden: touch and the keyboard scroll natively.
The scroller joins the Tab order only while it overflows, its focus ring drawn on the root, and a
child focused from the keyboard scrolls in clear of the fades. variant depth is a CSS scroll-driven
animation, skipped under reduced motion and where animation-timeline is unsupported.
Retune on the root: --scroll-area-fade (fade depth, default --space-7), --scroll-area-gap (between
rail items, --space-3), --scroll-area-depth (scale at the edge, 0.86).

```tsx
<ScrollArea ariaLabel="Recent activity" style={{ maxHeight: 320 }}>
  {events.map((event) => <div key={event.id}>{event.title}</div>)}
</ScrollArea>
<ScrollArea axis="x" ariaLabel="Media library">
  {media.map((item) => <img key={item.id} src={item.thumbUrl} alt={item.alt} width={160} />)}
</ScrollArea>
```
