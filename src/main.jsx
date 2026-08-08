import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Noir from './Noir.jsx';
import './base.css';

// base.css hides `.reveal` only under `html.js`, so an environment without
// JavaScript never gets a page of invisible sections.
document.documentElement.classList.add('js');

// Failsafe: nothing may stay invisible because a reveal failed to fire.
setTimeout(() => {
  document.querySelectorAll('.reveal').forEach((el) => {
    if (parseFloat(getComputedStyle(el).opacity) < 0.5) {
      el.style.opacity = '1';
      el.style.filter = 'none';
      el.style.transform = 'none';
    }
  });
}, 3200);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Noir />
  </StrictMode>
);
