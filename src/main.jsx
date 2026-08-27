import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import Noir from './Noir.jsx';
import './base.css';

// Both are decided by which document was served, not by anything at runtime —
// the shell carries lang="en"/"ar" and data-page="treatments" and so on. Reading
// them off <html> rather than parsing location.pathname means the client can
// never disagree with what the prerender rendered, which is what a hydration
// mismatch is made of.
const lang = document.documentElement.lang === 'ar' ? 'ar' : 'en';
const page = document.documentElement.dataset.page || 'home';

const container = document.getElementById('root');
const app = (
  <StrictMode>
    <Noir lang={lang} page={page} />
  </StrictMode>
);

// A production build arrives with the markup already in place, so it hydrates.
// `npm run dev` serves an empty shell, so it mounts from scratch.
if (container.firstChild) hydrateRoot(container, app);
else createRoot(container).render(app);

// Tells the inline guard in the page shell that the bundle made it, so it
// leaves html.js alone and the reveals run as intended.
document.documentElement.setAttribute('data-hydrated', '');

// Failsafe: nothing may stay invisible because a reveal failed to fire.
//
// Pushed out past the intro curtain when there is one. The hero deliberately
// holds its entrance until the curtain lifts, and a sweep that landed in the
// middle of that would snap it visible and cancel the very animation it exists
// to protect.
const introRemaining = Math.max(0, (window.__introLiftAt ?? 0) - performance.now());
setTimeout(() => {
  document.querySelectorAll('.reveal').forEach((el) => {
    if (parseFloat(getComputedStyle(el).opacity) < 0.5) {
      el.style.opacity = '1';
      el.style.filter = 'none';
      el.style.transform = 'none';
    }
  });
}, 3200 + introRemaining);
