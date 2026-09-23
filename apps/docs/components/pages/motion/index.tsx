'use client';

import { FilesDemo } from './files';
import { GalleryDemo } from './gallery';
import { InboxDemo } from './inbox';
import { IslandDemo } from './island';
import { KanbanDemo } from './kanban';
import { SegmentedDemo } from './segmented';

function Code({ children }: { children: string }) {
  return <code className="doc-inline-code">{children}</code>;
}

export function MotionDoc() {
  return (
    <>
      <section className="guide-section" id="knobs">
        <h2 className="guide-section__title">The knobs</h2>
        <p className="guide-section__p">
          Every demo carries the same rail. <strong>Size</strong> picks how a box that changed size is reconciled:{' '}
          <Code>scale</Code> corrects it with a transform, <Code>morph</Code> animates the real width and height,{' '}
          <Code>none</Code> lets it snap. <strong>Timing</strong> at <Code>default</Code> is what a bare{' '}
          <Code>layout</Code> gets; the others are the house <Code>layout</Code>, <Code>glide</Code> and{' '}
          <Code>settle</Code> transitions, the last one a spring. <strong>Crossfade</strong> sits on the{' '}
          <Code>layoutId</Code> demos: the node that held the id rides the same path and fades out as the new one fades
          in.
        </p>
        <p className="guide-section__p">
          <Code>Alt ,</Code> and <Code>Alt .</Code> step every animation on the page slower and faster through the
          Motion devtools, and <Code>Alt P</Code> freezes it.
        </p>
      </section>

      <section className="guide-section" id="files">
        <h2 className="guide-section__title">File browser</h2>
        <p className="guide-section__p">
          <Code>layout</Code> on every card. Sorting reorders them; the view switch reflows every card into a new shape
          at once.
        </p>
        <FilesDemo />
      </section>

      <section className="guide-section" id="inbox">
        <h2 className="guide-section__title">Inbox</h2>
        <p className="guide-section__p">
          <Code>layout</Code> on every row. Opening a message changes that row&apos;s height and moves every row under
          it.
        </p>
        <InboxDemo />
      </section>

      <section className="guide-section" id="segmented">
        <h2 className="guide-section__title">Segmented control</h2>
        <p className="guide-section__p">
          One pill with a <Code>layoutId</Code>, rendered inside whichever option is active. Each click unmounts it from
          one button and mounts it in another.
        </p>
        <SegmentedDemo />
      </section>

      <section className="guide-section" id="kanban">
        <h2 className="guide-section__title">Kanban board</h2>
        <p className="guide-section__p">
          <Code>layout</Code> and <Code>layoutId</Code> together. A card that changes column remounts under a new parent
          while the cards around it close and open the gap.
        </p>
        <KanbanDemo />
      </section>

      <section className="guide-section" id="gallery">
        <h2 className="guide-section__title">Photo lightbox</h2>
        <p className="guide-section__p">
          The tile and the lightbox photo are different nodes sharing a <Code>layoutId</Code>. The scrim and the caption
          fade in on their own.
        </p>
        <GalleryDemo />
      </section>

      <section className="guide-section" id="island">
        <h2 className="guide-section__title">Dynamic island</h2>
        <p className="guide-section__p">
          Two nodes under one <Code>layoutId</Code>, keyed by state, so every toggle hands the box to different content
          with a different corner radius.
        </p>
        <IslandDemo />
      </section>
    </>
  );
}
