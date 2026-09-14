'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import { Odometer } from '@zyncat/ui/odometer';

import { DOCS, GROUPS } from '../../content/registry';
import { FeatureCard, FeatureGrid, Step, Steps } from '../kit';

function RollingStat({ value, label }: { value: number; label: string }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    setCurrent(value);
  }, [value]);

  return (
    <div className="stat">
      <span className="stat__value">
        <Odometer value={current} />
      </span>
      <span className="stat__label">{label}</span>
    </div>
  );
}

export function IntroductionDoc() {
  const componentCount = DOCS.filter((d) => !d.Content).length;
  const expressiveCount = GROUPS.find((g) => g.id === 'expressive')?.docs.length ?? 0;

  return (
    <>
      <div className="stat-strip">
        <RollingStat value={componentCount} label="Components" />
        <RollingStat value={0} label="Runtime dependencies" />
        <RollingStat value={expressiveCount} label="Expressive specimens" />
      </div>

      <section className="guide-section" id="overview">
        <h2 className="guide-section__title">Overview</h2>
        <p className="guide-section__p">
          <strong>Zyncat UI</strong> is a complete design system for React 19 — accessible primitives, form controls,
          data blocks and overlays, built on modern CSS and a token vocabulary small enough to hold in your head.
        </p>
        <p className="guide-section__p">
          Motion is not an add-on. Layout changes, collapses, presence transitions and digit rolls all run through one
          engine that speaks the browser&apos;s native Web Animations API — so there is <strong>no Tailwind</strong>,{' '}
          <strong>no CSS-in-JS</strong>, and <strong>no animation library</strong> underneath. These numbers above are
          rolling on the shipped{' '}
          <Link href="/odometer" className="doc-link">
            Odometer
          </Link>
          .
        </p>
        <div className="pull-quote">
          <p className="pull-quote__text">&#8220;Motion is physical state — nothing snaps, nothing teleports.&#8221;</p>
        </div>
      </section>

      <section className="guide-section" id="philosophy">
        <h2 className="guide-section__title">Philosophy &amp; Craft</h2>
        <p className="guide-section__p">
          Good interface design is a trust mechanism. When software feels intentional, responsive and physically
          grounded, people instinctively believe the engineering behind it. Four principles bind every component:
        </p>
        <ul className="guide-section__list">
          <li>
            <strong>Restraint over decoration.</strong> Every color, elevation, radius and interval is bounded by the
            token system — no arbitrary hex values, no ad-hoc padding, no utility clutter.
          </li>
          <li>
            <strong>Motion is physical state.</strong> Layout changes, collapses and digit rolls never snap or teleport,
            and every transition respects reduced-motion preferences.
          </li>
          <li>
            <strong>Modern CSS first.</strong> Cascade layers, nesting, container queries and{' '}
            <code className="doc-inline-code">:has()</code> — never JavaScript style injection or build-time
            transformers.
          </li>
          <li>
            <strong>Accessibility by default.</strong> Complete ARIA roles, keyboard control, focus traps and
            screen-reader announcements on every interactive element.
          </li>
        </ul>
      </section>

      <section className="guide-section" id="core-pillars">
        <h2 className="guide-section__title">Core Pillars</h2>
        <FeatureGrid>
          <FeatureCard
            icon="lightning"
            title="One WAAPI engine"
            description="Native browser animation with spring physics, playback scaling, FLIP layout morphing, and automatic reduced-motion handling."
          />
          <FeatureCard
            icon="package"
            title="Closed token vocabulary"
            description="Every dimension, font, radius and color resolves to a named CSS custom property. No magic numbers anywhere."
          />
          <FeatureCard
            icon="cpu"
            title="React 19 native"
            description="Built from the ground up for React 19 — ref as prop, useActionState, transitions, zero hydration bugs."
          />
          <FeatureCard
            icon="browsers"
            title="Universal SSR / SSG"
            description="Ships built ESM with 'use client' boundaries intact — Next.js, Remix, Astro, Vite and Cloudflare Pages just work."
          />
          <FeatureCard
            icon="rocket"
            title="Subpath treeshaking"
            description="No barrel export, deliberately. Importing @zyncat/ui/button ships the Button and its CSS — nothing else."
          />
          <FeatureCard
            icon="terminal"
            title="AI &amp; MCP native"
            description="A bundled Model Context Protocol server lets coding agents query the real API surface instead of guessing props."
          />
        </FeatureGrid>
      </section>

      <section className="guide-section" id="architecture">
        <h2 className="guide-section__title">Design Architecture</h2>
        <p className="guide-section__p">The system is organised into four layers with strict boundary rules:</p>

        <Steps>
          <Step number={1} title="Tokens">
            <p className="guide-section__p">
              The raw vocabulary in <code className="doc-inline-code">styles.css</code> — surfaces, text hierarchy,
              borders, radii, z-indices, and the motion scale of durations and easings.
            </p>
          </Step>
          <Step number={2} title="Primitives">
            <p className="guide-section__p">
              Single-purpose controls with minimal state:{' '}
              <Link href="/button" className="doc-link">
                Button
              </Link>
              ,{' '}
              <Link href="/collapse" className="doc-link">
                Collapse
              </Link>
              ,{' '}
              <Link href="/badge" className="doc-link">
                Badge
              </Link>
              ,{' '}
              <Link href="/spinner" className="doc-link">
                Spinner
              </Link>
              .
            </p>
          </Step>
          <Step number={3} title="Forms &amp; data">
            <p className="guide-section__p">
              Standard HTML semantics with integrated labels and error states:{' '}
              <Link href="/text-field" className="doc-link">
                TextField
              </Link>
              ,{' '}
              <Link href="/select" className="doc-link">
                Select
              </Link>
              ,{' '}
              <Link href="/toggle" className="doc-link">
                Toggle
              </Link>
              ,{' '}
              <Link href="/table" className="doc-link">
                Table
              </Link>
              ,{' '}
              <Link href="/date-field" className="doc-link">
                DateField
              </Link>
              .
            </p>
          </Step>
          <Step number={4} title="Overlays &amp; expressive">
            <p className="guide-section__p">
              Portal-anchored surfaces and the creative tier:{' '}
              <Link href="/dialog" className="doc-link">
                Dialog
              </Link>
              ,{' '}
              <Link href="/toast" className="doc-link">
                Toast
              </Link>
              ,{' '}
              <Link href="/odometer" className="doc-link">
                Odometer
              </Link>
              ,{' '}
              <Link href="/lens" className="doc-link">
                Lens
              </Link>
              ,{' '}
              <Link href="/confetti" className="doc-link">
                Confetti
              </Link>
              , and the pinned-metric replicas.
            </p>
          </Step>
        </Steps>
      </section>

      <section className="guide-section" id="next-steps">
        <h2 className="guide-section__title">Next Steps</h2>
        <p className="guide-section__p">
          Follow the installation guide to wire Zyncat UI into your app, read how the four override levels retheme it,
          or point your coding agent at the MCP server.
        </p>
        <div className="page-pagination" style={{ marginTop: '1rem', borderTop: 'none', paddingTop: 0 }}>
          <Link href="/installation" className="pagination-card">
            <span className="pagination-card__sub">Next step</span>
            <span className="pagination-card__title">Installation &amp; Setup →</span>
          </Link>
          <Link href="/theming" className="pagination-card pagination-card--next">
            <span className="pagination-card__sub">Make it yours</span>
            <span className="pagination-card__title">Theming &amp; Overrides →</span>
          </Link>
        </div>
      </section>
    </>
  );
}
