import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import LocalModeBadge from './LocalModeBadge';
import Dialog from './Dialog';

/**
 * Console header: the title, the persistent local-mode marker, the unsaved
 * indicator and the way back to the page. Leaving with unsaved changes is
 * confirmed first.
 *
 * @param {Object} props
 * @param {boolean} props.dirty
 */
export default function StudioHeader({ dirty }) {
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);

  return (
    <header className="admin-header" data-component="studio-header">
      <div className="admin-header__row">
        <div className="admin-header__titles">
          <h1 className="admin-header__title">Студия ссылок</h1>
          <p className="admin-header__subtitle">Katy Delma · локальная админпанель</p>
        </div>

        <div className="admin-header__actions">
          <LocalModeBadge />
          {dirty ? (
            <p className="admin-unsaved" role="alert" data-component="unsaved-indicator">
              Есть несохранённые изменения
            </p>
          ) : null}
          <Link
            className="admin-button admin-button--secondary"
            to="/"
            onClick={(event) => {
              if (!dirty) return;
              event.preventDefault();
              setConfirming(true);
            }}
          >
            <ArrowLeft className="admin-button__glyph" aria-hidden="true" />
            К странице
          </Link>
        </div>
      </div>

      {confirming ? (
        <Dialog
          title="Уйти со страницы?"
          confirmLabel="Уйти без сохранения"
          cancelLabel="Остаться"
          onConfirm={() => {
            setConfirming(false);
            navigate('/');
          }}
          onCancel={() => setConfirming(false)}
        >
          <p>Есть несохранённые изменения. При уходе они будут потеряны.</p>
        </Dialog>
      ) : null}
    </header>
  );
}
