import { Fragment } from 'react';

/**
 * A section standfirst, with `\n` meaning a line break.
 *
 * Every other piece of multi-line copy in i18n.js is an array joined on `\n`,
 * and SplitWords already renders that as a <br>. A plain <p> collapses it to a
 * space instead, so a sub written on two lines arrived as one. This makes the
 * newline mean the same thing here as it does everywhere else in the copy.
 */
export default function Sub({ text }) {
  return (
    <p className="nr__sub">
      {String(text).split('\n').map((line, i) => (
        <Fragment key={i}>{i > 0 && <br />}{line}</Fragment>
      ))}
    </p>
  );
}
