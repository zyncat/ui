'use client';

import { useState } from 'react';

import { Motion, type Layer } from '@zyncat/ui/motion';
import { UIMotion } from '@zyncat/ui/motion-tokens';

import './gallery.css';

import { Playground } from '../../playground';
import { useLayoutKnobs } from './knobs';

const PHOTOS = [
  {
    id: 'harbor',
    title: 'Harbor at dusk',
    place: 'Lisbon, Portugal',
    art: 'linear-gradient(170deg, #1d2b4f 0%, #6d3f8c 38%, #d9667b 68%, #f6b26b 100%)',
  },
  {
    id: 'dunes',
    title: 'Erg Chebbi',
    place: 'Merzouga, Morocco',
    art: 'radial-gradient(80% 60% at 72% 18%, #fff1c9 0%, rgba(255, 241, 201, 0) 60%), linear-gradient(175deg, #f4c07a 0%, #d0773f 58%, #7a3b24 100%)',
  },
  {
    id: 'fjord',
    title: 'Geirangerfjord',
    place: 'Møre og Romsdal, Norway',
    art: 'linear-gradient(180deg, #a9cfe3 0%, #4f86a3 42%, #1f4b3f 68%, #0e1f24 100%)',
  },
  {
    id: 'terraces',
    title: 'Rice terraces',
    place: 'Tegallalang, Bali',
    art: 'radial-gradient(120% 90% at 22% 12%, rgba(255, 236, 196, 0.9) 0%, rgba(255, 236, 196, 0) 55%), linear-gradient(168deg, #1f3b33 0%, #3f6d58 38%, #96b184 66%, #e2d3ac 100%)',
  },
  {
    id: 'aurora',
    title: 'Aurora',
    place: 'Tromsø, Norway',
    art: 'radial-gradient(70% 50% at 40% 35%, rgba(64, 224, 160, 0.75) 0%, rgba(64, 224, 160, 0) 70%), linear-gradient(190deg, #03101c 0%, #0b2a3a 55%, #10202c 100%)',
  },
  {
    id: 'bloom',
    title: 'Philosopher’s Path',
    place: 'Kyoto, Japan',
    art: 'radial-gradient(60% 60% at 30% 30%, #ffe0ea 0%, rgba(255, 224, 234, 0) 70%), linear-gradient(160deg, #f7b6c8 0%, #d9788f 50%, #5b3a4a 100%)',
  },
];

const FADE_IN: Layer = { opacity: [0, 1], timing: UIMotion.t.enter };

const CODE = `{photos.map((photo) =>
  photo.id === openId ? (
    <span key={photo.id} className="tile-slot" />
  ) : (
    <Motion key={photo.id} as="button" layoutId={photo.id} className="tile" onClick={() => setOpenId(photo.id)} />
  ),
)}
{open ? (
  <div className="lightbox" onClick={() => setOpenId(null)}>
    <Motion layoutId={open.id} className="lightbox__photo" />
    <p>{open.title}</p>
  </div>
) : null}`;

export function GalleryDemo() {
  const { tuning, rail } = useLayoutKnobs(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const open = PHOTOS.find((photo) => photo.id === openId);

  return (
    <Playground
      code={CODE}
      rail={rail}
      layout="under"
      note="A square tile opens into a wide photo: position, aspect ratio and corner radius change in one flight."
    >
      <div className="ml-gallery">
        {PHOTOS.map((photo) =>
          photo.id === openId ? (
            <span key={photo.id} className="ml-gallery__slot" />
          ) : (
            <Motion
              key={photo.id}
              as="button"
              type="button"
              layoutId={`ml-photo-${photo.id}`}
              layoutTransition={tuning}
              className="ml-gallery__tile"
              style={{ background: photo.art }}
              aria-label={`Open ${photo.title}`}
              onClick={() => setOpenId(photo.id)}
            />
          ),
        )}
      </div>
      {open ? (
        <div className="ml-lightbox" onClick={() => setOpenId(null)}>
          <Motion className="ml-lightbox__scrim" animate={FADE_IN} />
          <figure className="ml-lightbox__figure">
            <Motion
              layoutId={`ml-photo-${open.id}`}
              layoutTransition={tuning}
              className="ml-lightbox__photo"
              style={{ background: open.art }}
            />
            <Motion as="figcaption" className="ml-lightbox__caption" animate={FADE_IN}>
              <strong>{open.title}</strong> {open.place}
            </Motion>
          </figure>
          <button type="button" className="ml-lightbox__close" autoFocus>
            Close
          </button>
        </div>
      ) : null}
    </Playground>
  );
}
