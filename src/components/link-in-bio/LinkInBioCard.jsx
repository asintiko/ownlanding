import { computeRevealDelays, effectivePlatform, linksOfKind, themeStyle } from '../../lib/draft';
import { linkHostLabel } from '../../lib/platformDetect';
import LinkButton from './LinkButton';
import SocialRow from './SocialRow';

/** Accessible name for a social icon: the platform when known, the domain otherwise. */
function socialName(link) {
  if (link.label?.trim()) return link.label.trim();
  const platform = effectivePlatform(link);
  if (platform.label) return platform.label;
  if (platform.key !== 'link') return platform.key;
  return linkHostLabel(link.url) || 'Link';
}

/**
 * The whole link-in-bio page: one mobile-first card layered over a full-bleed
 * golden-hour photograph, with a readability scrim between photo and content.
 *
 * @param {Object} props
 * @param {{profile: object, theme: object, links: Array}} props.content
 */
export default function LinkInBioCard({ content }) {
  const { profile, theme, links } = content;
  const contentLinks = linksOfKind(links, 'content');
  const socialLinks = linksOfKind(links, 'social');
  const delays = computeRevealDelays(contentLinks.length, socialLinks.length);

  const socialItems = socialLinks.map((link) => ({
    id: link.id,
    url: link.url,
    glyph: effectivePlatform(link).key,
    name: socialName(link),
  }));

  return (
    <main className="stage" style={themeStyle(theme)} data-component="link-in-bio-page">
      <section className="card" data-component="link-in-bio">
        <img className="card__media" src={profile.backgroundSrc} alt="" />
        <div className="card__scrim" aria-hidden="true" />

        <div className="card__content">
          <img
            className="avatar reveal"
            style={{ '--reveal-delay': `${delays.avatar}ms` }}
            src={profile.avatarSrc}
            alt={profile.name}
            width="112"
            height="112"
            data-component="creator-avatar"
          />

          <div className="identity" data-component="identity-block">
            <h1
              className="identity__name reveal"
              style={{ '--reveal-delay': `${delays.name}ms` }}
            >
              {profile.name}
            </h1>
            <p className="identity__bio reveal" style={{ '--reveal-delay': `${delays.bio}ms` }}>
              {profile.bio}
            </p>
          </div>

          {contentLinks.length > 0 ? (
            <nav className="link-stack" aria-label="Primary links" data-component="link-stack">
              {contentLinks.map((link, index) => (
                <LinkButton
                  key={link.id}
                  label={link.label}
                  url={link.url}
                  icon={link.icon}
                  revealDelay={delays.links[index] ?? delays.links[delays.links.length - 1] ?? 0}
                />
              ))}
            </nav>
          ) : null}

          <SocialRow items={socialItems} revealDelay={delays.social} />

          {profile.footerNote ? (
            <p
              className="footer-note reveal"
              style={{ '--reveal-delay': `${delays.footer}ms` }}
              data-component="footer-note"
            >
              {profile.footerNote}
            </p>
          ) : null}
        </div>
      </section>
    </main>
  );
}
