import { NAV, pathFor } from '../routes.js';
import { dialable, waLink } from '../i18n.js';

/**
 * The bar the split exists for.
 *
 * Plain <a href> to real documents, never a click handler: this has to work in
 * the prerendered HTML before the bundle lands, and a crawler has to be able to
 * walk it to find the other three pages. That is the whole reason the site is
 * still an MPA.
 *
 * `aria-current="page"` — not a class alone — is what tells a screen reader
 * which of the five it is already on. The contact entry never takes it: it
 * points at a section of the home page, so on `/` it would claim to be a second
 * current page.
 */
export default function Nav({ t, lang, page }) {
  // Both from the reach rows, so the bar cannot drift from the section that
  // publishes the same numbers a scroll further down.
  const phone = t.reach.items.find((i) => i.key === 'phone')?.values[0];
  const whatsapp = t.reach.items.find((i) => i.key === 'whatsapp')?.values[0];
  const other = lang === 'en' ? 'ar' : 'en';

  return (
    <header className="nr__bar">
      <a className="nr__skip" href="#main">{t.nav.skip}</a>

      <a className="nr__mark" href={pathFor(lang, 'home')}>
        <img src="/img/mark.png" alt="" width="32" height="32" decoding="async" />
        <span>{t.clinic}</span>
      </a>

      <nav className="nr__menu" aria-label={t.nav.label}>
        {NAV.map((item) => {
          const href = pathFor(lang, item.page) + (item.hash ? `#${item.hash}` : '');
          const current = !item.hash && item.page === page;
          return (
            <a
              key={item.id}
              href={href}
              className={`nr__navLink${current ? ' is-current' : ''}`}
              aria-current={current ? 'page' : undefined}
            >
              {t.nav[item.id]}
            </a>
          );
        })}
      </nav>

      <div className="nr__barActs">
        {phone && (
          <a className="nr__barBtn" href={`tel:${dialable(phone)}`}>
            <span aria-hidden="true">&#9742;</span>
            <span className="nr__barBtnText">{t.nav.call}</span>
          </a>
        )}
        {whatsapp && (
          // rel is what keeps the opened tab from reaching back into this one
          // through window.opener
          <a
            className="nr__barBtn nr__barBtn--wa"
            href={waLink(whatsapp)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="nr__barBtnText">{t.nav.whatsapp}</span>
          </a>
        )}
        {/* The switch lands on the SAME page in the other language, not on the
            other language's front door. A reader three pages in does not want
            to start over to change script. */}
        <a
          className="nr__lang"
          href={pathFor(other, page)}
          hrefLang={t.switchTo.code}
          lang={t.switchTo.code}
          title={t.switchTo.title}
        >
          {t.switchTo.label}
        </a>
      </div>
    </header>
  );
}
