import { CONTENT_ICONS } from '../icons/glyphs';

/**
 * One full-width capsule link button.
 *
 * Anatomy: leading line icon, centred label, trailing spacer so the label stays
 * optically centred inside the pill. The whole capsule is the link.
 *
 * @param {Object} props
 * @param {string} props.label  Visible button label.
 * @param {string} props.url    Destination.
 * @param {string} props.icon   Icon key from the studio.
 * @param {number} props.revealDelay  Entrance delay in milliseconds.
 */
export default function LinkButton({ label, url, icon, revealDelay = 0 }) {
  const Icon = CONTENT_ICONS[icon] || CONTENT_ICONS.link;

  return (
    <a
      className="link-button reveal"
      style={{ '--reveal-delay': `${revealDelay}ms` }}
      href={url}
      data-component="link-button"
    >
      <Icon className="link-button__icon" aria-hidden="true" strokeWidth={1.8} />
      <span className="link-button__label">{label}</span>
      <span className="link-button__spacer" aria-hidden="true" />
    </a>
  );
}
