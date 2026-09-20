const DESCRIPTION =
  'Локальная студия: данные хранятся в файле на этом компьютере, без входа в аккаунт и без облачной синхронизации.';

/** Static marker stating that the console is local, single-operator and offline. */
export default function LocalModeBadge() {
  return (
    <p className="admin-local-badge" role="note" aria-label={DESCRIPTION} data-component="local-mode-badge">
      <span className="admin-local-badge__dot" aria-hidden="true" />
      <span aria-hidden="true">Локальная студия</span>
    </p>
  );
}
