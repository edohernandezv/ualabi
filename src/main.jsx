import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';

// El 3D es decorativo: no se monta en pantallas chicas ni con
// reduced-motion, y su bundle solo se descarga si se va a usar.
const HeroCanvas = lazy(() => import('./HeroCanvas'));

const host = document.getElementById('blob');
const wide = window.matchMedia('(min-width:1101px)').matches;
const motionOk = !window.matchMedia('(prefers-reduced-motion:reduce)').matches;

if (host && wide && motionOk) {
  createRoot(host).render(
    <StrictMode>
      <Suspense fallback={null}>
        <HeroCanvas />
      </Suspense>
    </StrictMode>
  );
  host.classList.add('ready');
}
