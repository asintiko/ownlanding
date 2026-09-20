import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { clearToken, getToken } from '../lib/session.js';
import {
  changeCredential,
  createCredential,
  fetchAuthStatus,
  resetCredentialLocally,
  signIn,
  signOut,
} from '../lib/authApi.js';
import { fetchContent, fetchMedia, resetContent, saveContent, uploadImage } from '../lib/contentApi.js';
import { bundledContent } from '../lib/siteContent.js';
import {
  createLink,
  hasErrors,
  moveLink,
  resequence,
  serializeForCompare,
  validateDraft,
} from '../lib/draft.js';

const ConsoleContext = createContext(null);

const EMPTY_VALIDATION = { fieldErrors: {}, linkErrors: {}, summary: [] };

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

/**
 * One source of truth for the signed-in console, so moving between the
 * destination screens never loses an edit and the save state stays accurate.
 */
export function ConsoleProvider({ children }) {
  /* ------------------------------ access ------------------------------ */
  const [authPhase, setAuthPhase] = useState('checking');
  const [address, setAddress] = useState('');
  const [authError, setAuthError] = useState(null);
  const [authBusy, setAuthBusy] = useState(false);

  useEffect(() => {
    let alive = true;

    (async () => {
      const status = await fetchAuthStatus();
      if (!alive) return;
      if (!status.ok) {
        setAuthPhase('offline');
        return;
      }
      if (!status.configured) {
        setAuthPhase('setup');
        return;
      }
      if (getToken()) {
        const content = await fetchContent();
        if (!alive) return;
        if (content) {
          setDraft(clone(content));
          setSaved(clone(content));
          setLoading(false);
          setAuthPhase('ready');
          return;
        }
        clearToken();
      }
      setAuthPhase('signin');
    })();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const beginSession = useCallback(async (content) => {
    setDraft(clone(content));
    setSaved(clone(content));
    setLoading(false);
    setAuthPhase('ready');
    setMediaItems(await fetchMedia());
  }, []);

  const handleSignIn = useCallback(
    async (values) => {
      setAuthBusy(true);
      setAuthError(null);
      const result = await signIn(values);
      setAuthBusy(false);

      if (!result.ok) {
        setAuthError({ message: result.errors.join(' '), keepValues: true });
        return false;
      }
      setAddress(result.address);
      await beginSession((await fetchContent()) ?? clone(bundledContent));
      return true;
    },
    [beginSession]
  );

  const handleSetup = useCallback(
    async (values) => {
      setAuthBusy(true);
      setAuthError(null);
      const result = await createCredential(values);
      setAuthBusy(false);

      if (!result.ok) {
        setAuthError({ message: result.errors.join(' '), keepValues: true });
        return false;
      }
      setAddress(result.address);
      await beginSession((await fetchContent()) ?? clone(bundledContent));
      return true;
    },
    [beginSession]
  );

  const handleForgot = useCallback(async () => {
    setAuthBusy(true);
    setAuthError(null);
    const result = await resetCredentialLocally();
    setAuthBusy(false);

    if (!result.ok) {
      setAuthError({ message: result.errors.join(' '), keepValues: true });
      return false;
    }
    setAuthPhase('setup');
    return true;
  }, []);

  const handleSignOut = useCallback(async () => {
    await signOut();
    setAuthPhase('signin');
    setAuthError(null);
    setLoading(true);
  }, []);

  const handleChangeCredential = useCallback(async (values) => {
    const result = await changeCredential(values);
    if (result.ok) setAddress(result.address);
    return result;
  }, []);

  /* ------------------------------ content ----------------------------- */
  const [draft, setDraft] = useState(() => clone(bundledContent));
  const [saved, setSaved] = useState(() => clone(bundledContent));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [validation, setValidation] = useState(EMPTY_VALIDATION);
  const [status, setStatus] = useState(null);
  const [failureCount, setFailureCount] = useState(0);
  const [uploadingField, setUploadingField] = useState(null);
  const [mediaItems, setMediaItems] = useState([]);

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
    setDraft((current) => ({
      ...current,
      links: resequence([...current.links, createLink(kind)]),
    }));
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

  const refreshMedia = useCallback(async () => {
    setMediaItems(await fetchMedia());
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
    setMediaItems(await fetchMedia());
    setStatus({
      variant: 'neutral',
      message: 'Файл загружен. Нажмите «Сохранить», чтобы изменение осталось на странице.',
    });
  }, []);

  const assignMedia = useCallback((field, path) => {
    setDraft((current) => ({ ...current, profile: { ...current.profile, [field]: path } }));
    setStatus({
      variant: 'neutral',
      message: 'Изображение выбрано. Нажмите «Сохранить», чтобы изменение осталось на странице.',
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
      return { ok: false, invalid: true };
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
      setFailureCount((count) => count + 1);
      setStatus({
        variant: 'error',
        message: 'Не удалось сохранить изменения. Проверьте подключение к файлу базы и попробуйте снова.',
        details: response.errors,
      });
      return { ok: false, unauthorized: response.unauthorized === true };
    }

    setDraft(clone(response.content));
    setSaved(clone(response.content));
    setValidation(EMPTY_VALIDATION);
    setFailureCount(0);
    setStatus({ variant: 'success', message: 'Изменения сохранены' });
    return { ok: true };
  }, [draft]);

  const handleReset = useCallback(async () => {
    setSaving(true);
    setStatus(null);

    const response = await resetContent();
    setSaving(false);

    if (!response.ok) {
      setStatus({
        variant: 'error',
        message: 'Не удалось сбросить данные. Проверьте подключение к файлу базы и попробуйте снова.',
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

  const value = {
    /* access */
    authPhase,
    address,
    authError,
    authBusy,
    clearAuthError: () => setAuthError(null),
    signInWith: handleSignIn,
    setUpWith: handleSetup,
    forgotPassword: handleForgot,
    signOutFrom: handleSignOut,
    changePassword: handleChangeCredential,
    /* content */
    draft,
    saved,
    loading,
    saving,
    dirty,
    validation,
    status,
    setStatus,
    failureCount,
    uploadingField,
    mediaItems,
    updateProfile,
    updateTheme,
    updateLink,
    addLink,
    moveLinkById,
    deleteLinkById,
    deleteAllOfKind,
    upload: handleUpload,
    assignMedia,
    refreshMedia,
    save: handleSave,
    reset: handleReset,
  };

  return <ConsoleContext.Provider value={value}>{children}</ConsoleContext.Provider>;
}

export function useConsole() {
  const context = useContext(ConsoleContext);
  if (!context) throw new Error('useConsole must be used inside ConsoleProvider');
  return context;
}
