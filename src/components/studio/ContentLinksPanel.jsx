import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import StudioPanel from './StudioPanel';
import ContentLinkRow from './ContentLinkRow';
import EmptyState from './EmptyState';
import Dialog from './Dialog';

/**
 * Content link collection: the full-width capsule buttons, in page order.
 *
 * @param {Object} props
 * @param {Array} props.links          Content links, already in display order.
 * @param {Record<string, object>} props.linkErrors
 * @param {boolean} props.disabled
 * @param {() => void} props.onAdd
 * @param {(id: string, patch: object) => void} props.onChange
 * @param {(id: string, direction: number) => void} props.onMove
 * @param {(id: string) => void} props.onDelete
 * @param {() => void} props.onDeleteAll
 */
export default function ContentLinksPanel({
  links,
  linkErrors,
  disabled,
  onAdd,
  onChange,
  onMove,
  onDelete,
  onDeleteAll,
}) {
  const [confirming, setConfirming] = useState(false);

  return (
    <StudioPanel
      title="Кнопки-ссылки"
      hint="Порядок строк здесь — это порядок кнопок на странице."
    >
      {links.length === 0 ? (
        <EmptyState variant="content" onAdd={onAdd} disabled={disabled} />
      ) : (
        <>
          <ul className="admin-row-list">
            {links.map((link, index) => (
              <ContentLinkRow
                key={link.id}
                link={link}
                index={index}
                total={links.length}
                errors={linkErrors[link.id]}
                disabled={disabled}
                onChange={(patch) => onChange(link.id, patch)}
                onMove={(direction) => onMove(link.id, direction)}
                onDelete={() => onDelete(link.id)}
              />
            ))}
          </ul>

          <div className="admin-list-footer">
            <button
              type="button"
              className="admin-button admin-button--secondary"
              onClick={onAdd}
              disabled={disabled}
            >
              <Plus className="admin-button__glyph" aria-hidden="true" />
              Добавить ссылку
            </button>
            <button
              type="button"
              className="admin-button admin-button--destructive"
              onClick={() => setConfirming(true)}
              disabled={disabled}
            >
              <Trash2 className="admin-button__glyph" aria-hidden="true" />
              Удалить все ссылки
            </button>
          </div>
        </>
      )}

      {confirming ? (
        <Dialog
          title="Удалить все ссылки?"
          confirmLabel="Удалить все"
          onConfirm={() => {
            setConfirming(false);
            onDeleteAll();
          }}
          onCancel={() => setConfirming(false)}
        >
          <p>
            Будут удалены все кнопки-ссылки: {links.map((link) => `«${link.label || 'без названия'}»`).join(', ')}.
          </p>
          <p>Нижний ряд соцсетей это не затрагивает.</p>
        </Dialog>
      ) : null}
    </StudioPanel>
  );
}
