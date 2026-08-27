import { NAV, SERVICES, pathFor } from '../routes.js';
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
          const href = pathFor(lang, item.page);
          const current = item.page === page;
          const link = (
            <a
              href={href}
              className={`nr__navLink${current ? ' is-current' : ''}`}
              aria-current={current ? 'page' : undefined}
            >
              {t.nav[item.id]}
              {item.menu && <span className="nr__caret" aria-hidden="true" />}
            </a>
          );

          if (!item.menu) return <span key={item.id} className="nr__navItem">{link}</span>;

          // The dropdown is CSS-only — :hover for a pointer, :focus-within for a
          // keyboard. No state, no handler, and nothing to hydrate: it works in
          // the prerendered HTML before the bundle lands, and a crawler reads
          // nine real links to nine real anchors rather than a button it cannot
          // press. The parent stays a link, so a tap on a touch screen (where
          // there is no hover) still goes to the page.
          return (
            <span key={item.id} className="nr__navItem nr__navItem--has">
              {link}
              <div className="nr__drop">
                <ul>
                  {t.treatments.items.map((s, i) => (
                    <li key={SERVICES[i]}>
                      <a href={`${href}#${SERVICES[i]}`}>{s.name}</a>
                    </li>
                  ))}
                </ul>
              </div>
            </span>
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
