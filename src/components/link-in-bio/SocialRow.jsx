import { isFilledGlyph, resolveSocialGlyph } from '../icons/glyphs';

/**
 * Compact social icon row (icon-only discs, no labels).
 *
 * @param {Object} props
 * @param {Array<{id: string, url: string, glyph: string, name: string}>} props.items
 * @param {number} props.revealDelay
 */
export default function SocialRow({ items, revealDelay = 0 }) {
  if (items.length === 0) return null;

  return (
    <nav
      className="social-row reveal"
      style={{ '--reveal-delay': `${revealDelay}ms` }}
      aria-label="Social profiles"
      data-component="social-row"
    >
      {items.map((item) => {
        const Glyph = resolveSocialGlyph(item.glyph);

        return (
          <a
            key={item.id}
            className="social-disc"
            href={item.url}
            aria-label={item.name}
            data-component="social-link"
          >
            <Glyph
              className="social-disc__glyph"
              aria-hidden="true"
              {...(isFilledGlyph(item.glyph) ? {} : { strokeWidth: 1.7 })}
            />
          </a>
        );
      })}
    </nav>
  );
}
