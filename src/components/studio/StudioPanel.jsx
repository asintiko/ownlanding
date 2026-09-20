import { CornerRightDown } from 'lucide-react';

function jumpToPreview() {
  const target = document.querySelector('[data-component="admin-preview"]');
  if (!target) return;
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
}

/**
 * One white console panel: a heading, an optional hint and a stack of control
 * groups. The heading carries a ghost control that brings the preview into
 * view, so the page can be checked without scrolling back to the top.
 *
 * @param {Object} props
 * @param {string} props.title
 * @param {string} [props.hint]
 * @param {React.ReactNode} props.children
 */
export default function StudioPanel({ title, hint, children }) {
  return (
    <section className="admin-panel" data-component="studio-panel">
      <div className="admin-panel__head">
        <div className="admin-panel__title">
          <h2 className="admin-panel__heading">{title}</h2>
          {hint ? <p className="admin-panel__hint">{hint}</p> : null}
        </div>
        <button
          type="button"
          className="admin-icon-button"
          onClick={jumpToPreview}
          aria-label="К предпросмотру"
          title="К предпросмотру"
        >
          <CornerRightDown className="admin-icon-button__glyph" aria-hidden="true" />
        </button>
      </div>
      <div className="admin-panel__body">{children}</div>
    </section>
  );
}
