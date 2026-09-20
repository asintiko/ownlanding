import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import StudioPanel from './StudioPanel';
import SocialLinkRow from './SocialLinkRow';
import EmptyState from './EmptyState';
import Dialog from './Dialog';

/**
 * Social link collection: the bottom icon row. Each row is only an address —
 * the platform, and therefore the icon, comes from its domain unless the owner
 * switches that row to a manual choice.
 *
 * @param {Object} props
 * @param {Array} props.links          Social links, already in display order.
 * @param {Record<string, object>} props.linkErrors
 * @param {boolean} props.disabled
 * @param {() => void} props.onAdd
 * @param {(id: string, patch: object) => void} props.onChange
 * @param {(id: string, direction: number) => void} props.onMove
 * @param {(id: string) => void} props.onDelete
 * @param {() => void} props.onDeleteAll
 */
export default function SocialLinksPanel({
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
      title="Соцсети"
      hint="Значок определяется по адресу: t.me даст Telegram, youtube.com — YouTube и так далее. Незнакомый домен получает нейтральный значок, а значок можно выбрать вручную."
    >
      {links.length === 0 ? (
        <EmptyState variant="social" onAdd={onAdd} disabled={disabled} />
      ) : (
        <>
          <ul className="admin-row-list">
            {links.map((link, index) => (
              <SocialLinkRow
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
              Добавить соцсеть
            </button>
            <button
              type="button"
              className="admin-button admin-button--destructive"
              onClick={() => setConfirming(true)}
              disabled={disabled}
            >
              <Trash2 className="admin-button__glyph" aria-hidden="true" />
              Удалить все соцсети
            </button>
          </div>
        </>
      )}

      {confirming ? (
        <Dialog
          title="Удалить все соцсети?"
          confirmLabel="Удалить все"
          onConfirm={() => {
            setConfirming(false);
            onDeleteAll();
          }}
          onCancel={() => setConfirming(false)}
        >
          <p>
            Нижний ряд значков будет убран со страницы полностью; останется только подпись,
            если она заполнена.
          </p>
          <p>Сейчас в ряду: {links.length}.</p>
        </Dialog>
      ) : null}
    </StudioPanel>
  );
}
