# Motion / Presence - @zyncat/ui/motion

Group: primitives

The React layer over the engine: animate an element you render, and hold a leaving one mounted until its exit finishes.

`<Motion>` renders the tag in `as` and plays `animate` on mount, then again whenever `deps` change.
`exit` plays when a parent `<Presence>` drops the child, which stays mounted until it finishes - a
child with no `exit` is dropped at once. `layout` and `layoutId` FLIP the box from where it last was
instead of animating a value. Every spec is a `Layer`, a `Layer[]`, or a function returning the
`Playback`s to wait on.

`<Presence>` needs keyed children; `mode="wait"` holds the entering child back until the outgoing one
has left, and `initial={false}` skips the entrance for children present at its own first paint.

`useMotion(ref, specs)` is the same machinery for an element you hold a ref to but do not render.
`usePresence()` reads whether the current child is leaving. `popIn` / `popOut` / `slideIn` are the
named presets - feed them `UIMotion.scale` and `UIMotion.dist` from `@zyncat/ui/motion-tokens`, never
literals.

```tsx
<Presence mode="wait" onExitComplete={clearStep}>
  {step && (
    <Motion
      key={step.id}
      animate={popIn(UIMotion.scale.panel, UIMotion.t.enter)}
      exit={popOut(UIMotion.scale.panel, UIMotion.t.exit)}
      deps={[step.id]}
    >
      {step.body}
    </Motion>
  )}
</Presence>
```
