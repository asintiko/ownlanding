import { useEffect, useRef, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import LinkInBioCard from '../link-in-bio/LinkInBioCard';
import ViewportPresetSwitch, { VIEWPORT_PRESETS } from './ViewportPresetSwitch';

const FRAME_LABEL =
  'Предпросмотр страницы: неинтерактивный живой рендер с текущими правками, прокручивается сверху донизу.';

/**
 * Browsable preview of the real public page.
 *
 * The rendered page has no fixed height — it is the whole page from the top of
 * the sand wash to the bottom caption — and this viewport scrolls through all of
 * it. Nothing inside is scaled: changing a preset re-renders at the real width.
 *
 * @param {Object} props
 * @param {object} props.content
 * @param {boolean} props.dirty
 */
export default function PreviewViewport({ content, dirty }) {
  const [presetKey, setPresetKey] = useState(VIEWPORT_PRESETS[0].key);
  const scrollerRef = useRef(null);
  const pageRef = useRef(null);
  const pendingRatio = useRef(null);

  const preset = VIEWPORT_PRESETS.find((item) => item.key === presetKey) ?? VIEWPORT_PRESETS[0];

  useEffect(() => {
    const page = pageRef.current;
    if (page && 'inert' in page) page.inert = true;
  }, []);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || pendingRatio.current == null) return;
    scroller.scrollTop = pendingRatio.current * scroller.scrollHeight;
    pendingRatio.current = null;
  }, [presetKey]);

  const changePreset = (nextKey) => {
    const scroller = scrollerRef.current;
    if (scroller && scroller.scrollHeight > 0) {
      pendingRatio.current = scroller.scrollTop / scroller.scrollHeight;
    }
    setPresetKey(nextKey);
  };

  return (
    <section className="admin-preview-column" data-component="admin-preview">
      <div className="admin-preview-head">
        <h2 className="admin-panel__heading">Предпросмотр</h2>

        <div className="admin-preview-head__actions">
          <ViewportPresetSwitch value={presetKey} onChange={changePreset} />
          <a
            className="admin-button admin-button--secondary"
            href="/"
            target="_blank"
            rel="noopener"
          >
            <ExternalLink className="admin-button__glyph" aria-hidden="true" />
            <span className="admin-open-page__label">Открыть в новой вкладке</span>
          </a>
        </div>
      </div>

      <div className="admin-preview-viewport" data-component="admin-preview-viewport">
        <div className="admin-preview-viewport__fade admin-preview-viewport__fade--top" aria-hidden="true" />
        <div
          className="admin-preview-viewport__scroller"
          ref={scrollerRef}
          role="group"
          aria-label={FRAME_LABEL}
          tabIndex={0}
        >
          <div
            className="admin-preview-viewport__page"
            ref={pageRef}
            style={{ '--preview-page-width': `${preset.width}px` }}
          >
            <LinkInBioCard content={content} />
          </div>
        </div>
        <div className="admin-preview-viewport__fade admin-preview-viewport__fade--bottom" aria-hidden="true" />
      </div>

      <p className="admin-preview-note">
        {dirty
          ? 'Откроется сохранённая версия. Прокрутите окно предпросмотра, чтобы увидеть страницу целиком.'
          : 'Прокрутите окно предпросмотра, чтобы увидеть страницу целиком.'}
      </p>
    </section>
  );
}
