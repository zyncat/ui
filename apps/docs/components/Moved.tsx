'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export function Moved({ to, label }: { to: string; label: string }) {
  useEffect(() => {
    window.location.replace(to);
  }, [to]);

  return (
    <div className="doc-layout">
      <meta httpEquiv="refresh" content={`0; url=${to}`} />
      <article className="page">
        <header className="page__head">
          <div className="page__title-row">
            <h1 className="page__title">{label} moved</h1>
          </div>
          <p className="page__blurb">
            {label} is documented on the Badge page.{' '}
            <Link href={to} className="doc-link">
              Continue to {label}
            </Link>
            .
          </p>
        </header>
      </article>
    </div>
  );
}
