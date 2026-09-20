import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchContent, resetContent, saveContent, uploadImage } from '../lib/contentApi';
import { bundledContent } from '../lib/siteContent';
import {
  createLink,
  hasErrors,
  linksOfKind,
  moveLink,
  resequence,
  serializeForCompare,
  THEME_COLOR_ROWS,
  validateDraft,
} from '../lib/draft';
import StudioHeader from '../components/studio/StudioHeader';
import PreviewViewport from '../components/studio/PreviewViewport';
import IdentityPanel from '../components/studio/IdentityPanel';
import ImagesPanel from '../components/studio/ImagesPanel';
import TypefacesPanel from '../components/studio/TypefacesPanel';
import ThemePanel from '../components/studio/ThemePanel';
import ContentLinksPanel from '../components/studio/ContentLinksPanel';
import SocialLinksPanel from '../components/studio/SocialLinksPanel';
import ActionBar from '../components/studio/ActionBar';
import StatusBanner from '../components/studio/StatusBanner';

const EMPTY_VALIDATION = { fieldErrors: {}, linkErrors: {}, summary: [] };

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

/** Element id of the first invalid control, so an error can be focused. */
function firstInvalidElementId(validation, draft) {
  const colorKey = THEME_COLOR_ROWS.map((row) => row.key).find(
    (key) => validation.fieldErrors[`theme.${key}`]
  );
  if (colorKey) return `studio-theme-${colorKey}`;

  if (validation.fieldErrors['profile.name']) return 'studio-name';
  if (validation.fieldErrors['profile.bio']) return 'studio-bio';
  if (validation.fieldErrors['profile.footerNote']) return 'studio-footer';

  const linkId = Object.keys(validation.linkErrors)[0];
  if (linkId) {
    const link = draft.links.find((item) => item.id === linkId);
    if (!link) return null;
    if (validation.linkErrors[linkId].url) {
      return link.kind === 'content' ? `content-url-${linkId}` : `social-url-${linkId}`;
    }
    return `content-label-${linkId}`;
  }

  return null;
}

/** Nothing is editable until the saved state is known. */
function LoadingShell() {
  return (
    <div className="admin-page" data-component="studio-page">
      <div className="admin-shell">
        <header className="admin-header">
          <div className="admin-header__row">
            <div className="admin-header__titles">
              <h1 className="admin-header__title">Студия ссылок</h1>
              <p className="admin-header__subtitle">Katy Delma · локальная админпанель</p>
            </div>
          </div>
        </header>

        <div className="admin-workspace">
          <div className="admin-editor">
            {[0, 1, 2].map((index) => (
              <section className="admin-panel" key={index}>
                <div className="admin-panel__head">
                  <span className="admin-skeleton admin-skeleton--half" />
                </div>
                <div className="admin-panel__body">
                  <span className="admin-skeleton admin-skeleton--wide" />
                  <span className="admin-skeleton admin-skeleton--wide" />
                </div>
              </section>
            ))}
          </div>
        </div>

        <div className="admin-toolbar">
          <div className="admin-toolbar__row">
            <button type="button" className="admin-button admin-button--primary" disabled>
              Сохранить
            </button>
            <StatusBanner variant="pending" message="Загрузка данных…" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Local content console: edits every aspect of the link-in-bio page and persists
 * it to the SQLite file on this machine.
 */
export default function AdminPage() {
  const [draft, setDraft] = useState(() => clone(bundledContent));
  const [saved, setSaved] = useState(() => clone(bundledContent));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [studioOnline, setStudioOnline] = useState(true);
  const [uploadingField, setUploadingField] = useState(null);
  const [validation, setValidation] = useState(EMPTY_VALIDATION);
  const [status, setStatus] = useState(null);
  const [failureCount, setFailureCount] = useState(0);

  useEffect(() => {
    let alive = true;

    fetchContent().then((live) => {
      if (!alive) return;
      if (live && Array.isArray(live.links)) {
        setDraft(clone(live));
        setSaved(clone(live));
        setStudioOnline(true);
      } else {
        setStudioOnline(false);
        setStatus({
          variant: 'warning',
          message:
            'Локальная студия недоступна, поэтому сохранить правки нельзя. Откройте админпанель на компьютере, где запущен проект, и обновите страницу.',
        });
      }
      setLoading(false);
    });

    return () => {
      alive = false;
    };
  }, []);

  const dirty = useMemo(
    () => serializeForCompare(draft) !== serializeForCompare(saved),
    [draft, saved]
  );

  useEffect(() => {
    if (!dirty) return undefined;

    const warn = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const busy = saving || loading;

  const updateProfile = useCallback((key, value) => {
    setDraft((current) => ({ ...current, profile: { ...current.profile, [key]: value } }));
  }, []);

  const updateTheme = useCallback((key, value) => {
    setDraft((current) => ({ ...current, theme: { ...current.theme, [key]: value } }));
  }, []);

  const updateLink = useCallback((id, patch) => {
    setDraft((current) => ({
      ...current,
      links: current.links.map((link) => (link.id === id ? { ...link, ...patch } : link)),
    }));
  }, []);

  const addLink = useCallback((kind) => {
    setDraft((current) => {
      const created = createLink(kind);
      return { ...current, links: resequence([...current.links, created]) };
    });
  }, []);

  const moveLinkById = useCallback((id, direction) => {
    setDraft((current) => ({ ...current, links: moveLink(current.links, id, direction) }));
  }, []);

  const deleteLinkById = useCallback((id) => {
    setDraft((current) => ({
      ...current,
      links: resequence(current.links.filter((link) => link.id !== id)),
    }));
  }, []);

  const deleteAllOfKind = useCallback((kind) => {
    setDraft((current) => ({
      ...current,
      links: resequence(current.links.filter((link) => link.kind !== kind)),
    }));
  }, []);

  const handleUpload = useCallback(async (field, file) => {
    setUploadingField(field);
    const result = await uploadImage(file);
    setUploadingField(null);

    if (!result.ok) {
      setStatus({ variant: 'error', message: result.error });
      return;
    }

    setDraft((current) => ({ ...current, profile: { ...current.profile, [field]: result.path } }));
    setStatus({
      variant: 'neutral',
      message: 'Файл загружен. Нажмите «Сохранить», чтобы изменения остались на странице.',
    });
  }, []);

  const handleSave = useCallback(async () => {
    const result = validateDraft(draft);
    setValidation(result);

    if (hasErrors(result)) {
      setStatus({
        variant: 'error',
        message: 'Проверьте выделенные поля — данные не сохранены.',
        details: result.summary,
      });
      const elementId = firstInvalidElementId(result, draft);
      if (elementId) document.getElementById(elementId)?.focus();
      return;
    }

    setSaving(true);
    setStatus(null);

    const response = await saveContent({
      profile: draft.profile,
      theme: draft.theme,
      links: resequence(draft.links),
    });

    setSaving(false);

    if (!response.ok) {
      setStudioOnline(!response.offline);
      setFailureCount((count) => count + 1);
      setStatus({
        variant: 'error',
        message:
          'Не удалось сохранить изменения. Проверьте подключение к файлу базы и попробуйте снова.',
        details: response.errors,
      });
      return;
    }

    setDraft(clone(response.content));
    setSaved(clone(response.content));
    setValidation(EMPTY_VALIDATION);
    setFailureCount(0);
    setStatus({ variant: 'success', message: 'Изменения сохранены' });
  }, [draft]);

  const handleReset = useCallback(async () => {
    setSaving(true);
    setStatus(null);

    const response = await resetContent();
    setSaving(false);

    if (!response.ok) {
      setStatus({
        variant: 'error',
        message:
          'Не удалось сбросить данные. Проверьте подключение к файлу базы и попробуйте снова.',
        details: response.errors,
      });
      return;
    }

    setDraft(clone(response.content));
    setSaved(clone(response.content));
    setValidation(EMPTY_VALIDATION);
    setFailureCount(0);
    setStatus({ variant: 'success', message: 'Восстановлены значения по умолчанию' });
  }, []);

  if (loading) return <LoadingShell />;

  const contentLinks = linksOfKind(draft.links, 'content');
  const socialLinks = linksOfKind(draft.links, 'social');

  return (
    <div className="admin-page" data-component="studio-page">
      <div className="admin-shell">
        <StudioHeader dirty={dirty && studioOnline} />

        <div className="admin-workspace">
          <div className="admin-editor">
            <IdentityPanel
              profile={draft.profile}
              errors={validation.fieldErrors}
              disabled={busy}
              onChange={updateProfile}
            />

            <ImagesPanel
              profile={draft.profile}
              disabled={busy}
              uploadingField={uploadingField}
              onUpload={handleUpload}
            />

            <TypefacesPanel
              theme={draft.theme}
              profile={draft.profile}
              errors={validation.fieldErrors}
              disabled={busy}
              onChange={updateTheme}
            />

            <ThemePanel
              theme={draft.theme}
              errors={validation.fieldErrors}
              disabled={busy}
              onChange={updateTheme}
            />

            <ContentLinksPanel
              links={contentLinks}
              linkErrors={validation.linkErrors}
              disabled={busy}
              onAdd={() => addLink('content')}
              onChange={updateLink}
              onMove={moveLinkById}
              onDelete={deleteLinkById}
              onDeleteAll={() => deleteAllOfKind('content')}
            />

            <SocialLinksPanel
              links={socialLinks}
              linkErrors={validation.linkErrors}
              disabled={busy}
              onAdd={() => addLink('social')}
              onChange={updateLink}
              onMove={moveLinkById}
              onDelete={deleteLinkById}
              onDeleteAll={() => deleteAllOfKind('social')}
            />
          </div>

          <PreviewViewport content={draft} dirty={dirty} />
        </div>

        <ActionBar
          dirty={dirty}
          saving={saving}
          loading={loading || !studioOnline}
          busyLabel={saving ? 'Сохранение…' : null}
          status={status}
          failureCount={failureCount}
          onSave={handleSave}
          onReset={handleReset}
        />
      </div>
    </div>
  );
}
