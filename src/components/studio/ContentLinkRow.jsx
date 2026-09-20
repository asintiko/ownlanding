import { useState } from 'react';
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import Field from './Field';
import IconCatalogPicker from './IconCatalogPicker';
import Dialog from './Dialog';
import { CONTENT_ICON_LABELS, resolveContentIcon } from '../icons/glyphs';
import { LABEL_MAX } from '../../lib/draft';
import { linkHostLabel } from '../../lib/platformDetect';

/**
 * One content link: its position, label, destination and leading icon, with
 * explicit reorder controls, an inline icon catalogue and a confirmed delete.
 *
 * @param {Object} props
 * @param {object} props.link
 * @param {number} props.index
 * @param {number} props.total
 * @param {{label?: string, url?: string}} [props.errors]
 * @param {boolean} props.disabled
 * @param {(patch: object) => void} props.onChange
 * @param {(direction: number) => void} props.onMove
 * @param {() => void} props.onDelete
 */
export default function ContentLinkRow({
  link,
  index,
  total,
  errors,
  disabled,
  onChange,
  onMove,
  onDelete,
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const CurrentIcon = resolveContentIcon(link.icon);
  const title = link.label.trim() || 'без названия';
  const iconName = CONTENT_ICON_LABELS[link.icon] ?? 'Нейтральная ссылка';
  const host = linkHostLabel(link.url);

  return (
    <li className="admin-item-row" data-component="content-link-row">
      <span className="admin-item-row__order" aria-hidden="true">
        {index + 1}
      </span>

      <div className="admin-item-row__fields">
        <div className="admin-item-row__mini" aria-hidden="true">
          <span className="admin-mini-button">
            <CurrentIcon className="admin-mini-button__icon" strokeWidth={1.8} />
            <span className="admin-mini-button__label">{title}</span>
          </span>
          <span className="admin-mini-button__host">{host || (link.url === '#' ? 'заглушка #' : '—')}</span>
        </div>

        <Field
          id={`content-label-${link.id}`}
          label="Название"
          value={link.label}
          required
          maxLength={LABEL_MAX + 10}
          disabled={disabled}
          error={errors?.label}
          placeholder="Например: Travel Blog"
          onChange={(value) => onChange({ label: value })}
        />
        <Field
          id={`content-url-${link.id}`}
          label="Ссылка"
          value={link.url}
          required
          disabled={disabled}
          error={errors?.url}
          inputMode="url"
          placeholder="https://"
          helper="Подойдёт полный адрес или # как заглушка."
          onChange={(value) => onChange({ url: value })}
        />

        <button
          type="button"
          className="admin-icon-choice"
          aria-expanded={pickerOpen}
          disabled={disabled}
          onClick={() => setPickerOpen((open) => !open)}
        >
          <span className="admin-icon-choice__glyph-wrap">
            <CurrentIcon className="admin-icon-choice__glyph" aria-hidden="true" strokeWidth={1.8} />
          </span>
          <span className="admin-icon-choice__text">
            <span className="admin-icon-choice__label">Значок</span>
            <span className="admin-icon-choice__value">{iconName}</span>
          </span>
          <span className="admin-icon-choice__action">{pickerOpen ? 'Скрыть' : 'Выбрать'}</span>
        </button>
      </div>

      <div className="admin-item-row__cluster">
        <button
          type="button"
          className="admin-icon-button"
          aria-label="Переместить выше"
          title={index === 0 ? 'Это первая ссылка' : 'Переместить выше'}
          aria-disabled={index === 0 || undefined}
          disabled={disabled || index === 0}
          onClick={() => onMove(-1)}
        >
          <ChevronUp className="admin-icon-button__glyph" aria-hidden="true" />
        </button>
        <button
          type="button"
          className="admin-icon-button"
          aria-label="Переместить ниже"
          title={index === total - 1 ? 'Это последняя ссылка' : 'Переместить ниже'}
          aria-disabled={index === total - 1 || undefined}
          disabled={disabled || index === total - 1}
          onClick={() => onMove(1)}
        >
          <ChevronDown className="admin-icon-button__glyph" aria-hidden="true" />
        </button>
        <button
          type="button"
          className="admin-icon-button admin-icon-button--destructive"
          aria-label="Удалить ссылку"
          disabled={disabled}
          onClick={() => setConfirming(true)}
        >
          <Trash2 className="admin-icon-button__glyph" aria-hidden="true" />
        </button>
      </div>

      {pickerOpen ? (
        <IconCatalogPicker
          title={`Значок для «${title}»`}
          value={link.icon}
          disabled={disabled}
          onSelect={(key) => {
            onChange({ icon: key });
            setPickerOpen(false);
          }}
          onClose={() => setPickerOpen(false)}
        />
      ) : null}

      {confirming ? (
        <Dialog
          title="Удалить ссылку?"
          confirmLabel="Удалить"
          onConfirm={onDelete}
          onCancel={() => setConfirming(false)}
        >
          <p>Будет удалена кнопка «{title}».</p>
          <p>Адрес: {link.url || '—'}</p>
        </Dialog>
      ) : null}
    </li>
  );
}
