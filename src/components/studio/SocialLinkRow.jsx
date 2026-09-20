import { useState } from 'react';
import { ChevronDown, ChevronUp, Link2, Trash2 } from 'lucide-react';
import Field from './Field';
import IconPicker from './IconPicker';
import Dialog from './Dialog';
import Toggle from './Toggle';
import { PLATFORMS, detectPlatform, linkHostLabel } from '../../lib/platformDetect';
import { isFilledGlyph, resolveSocialGlyph } from '../icons/glyphs';

const PICKER_OPTIONS = [
  { key: 'link', label: 'Нейтральная ссылка', Glyph: resolveSocialGlyph('link') },
  ...PLATFORMS.map((platform) => ({
    key: platform.key,
    label: platform.label,
    Glyph: resolveSocialGlyph(platform.key),
  })),
].map((option) => ({ ...option, filled: isFilledGlyph(option.key) }));

/** What the bottom icon row will show for this address. */
function describe(link) {
  if (link.icon && link.icon !== 'auto') {
    const known = PLATFORMS.find((platform) => platform.key === link.icon);
    return {
      variant: 'override',
      glyph: link.icon,
      text: `Свой значок: ${known?.label ?? 'нейтральная ссылка'}`,
    };
  }

  const detected = detectPlatform(link.url);
  if (detected.key === 'link') {
    return { variant: 'unknown', glyph: 'link', text: 'Домен не распознан' };
  }
  return { variant: 'detected', glyph: detected.key, text: `Распознано: ${detected.label}` };
}

/**
 * One social destination: an address, whether its platform is detected from the
 * domain or chosen manually, and what will appear in the bottom icon row.
 *
 * @param {Object} props
 * @param {object} props.link
 * @param {number} props.index
 * @param {number} props.total
 * @param {{url?: string}} [props.errors]
 * @param {boolean} props.disabled
 * @param {(patch: object) => void} props.onChange
 * @param {(direction: number) => void} props.onMove
 * @param {() => void} props.onDelete
 */
export default function SocialLinkRow({
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

  const state = describe(link);
  const auto = !link.icon || link.icon === 'auto';
  const host = linkHostLabel(link.url);
  const BadgeGlyph = resolveSocialGlyph(state.glyph);
  const rowName = state.variant === 'unknown' ? host || 'не распознана' : state.text;

  return (
    <li className="admin-item-row" aria-label={`Соцсеть: ${rowName}`} data-component="social-link-row">
      <span className="admin-item-row__order" aria-hidden="true">
        {index + 1}
      </span>

      <div className="admin-item-row__fields">
        <Field
          id={`social-url-${link.id}`}
          label="Адрес профиля"
          value={link.url}
          required
          disabled={disabled}
          error={errors?.url}
          inputMode="url"
          placeholder="https://t.me/…"
          helper={
            state.variant === 'unknown' ? 'Будет использован нейтральный значок.' : undefined
          }
          onChange={(value) => onChange({ url: value })}
        />

        <Toggle
          label="Определять автоматически"
          onState="Автоматически"
          offState="Вручную"
          checked={auto}
          disabled={disabled}
          onChange={(next) => {
            if (next) {
              onChange({ icon: 'auto' });
              setPickerOpen(false);
              return;
            }
            const detected = detectPlatform(link.url);
            onChange({ icon: detected.key === 'link' ? 'link' : detected.key });
            setPickerOpen(true);
          }}
        />

        <p className={`admin-badge admin-badge--${state.variant}`}>
          <BadgeGlyph
            className="admin-badge__glyph"
            aria-hidden="true"
            {...(isFilledGlyph(state.glyph) ? {} : { strokeWidth: 1.7 })}
          />
          {state.text}
        </p>
      </div>

      <div className="admin-item-row__cluster">
        <button
          type="button"
          className="admin-icon-button"
          aria-label="Переместить выше"
          title={index === 0 ? 'Это первая соцсеть' : 'Переместить выше'}
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
          title={index === total - 1 ? 'Это последняя соцсеть' : 'Переместить ниже'}
          aria-disabled={index === total - 1 || undefined}
          disabled={disabled || index === total - 1}
          onClick={() => onMove(1)}
        >
          <ChevronDown className="admin-icon-button__glyph" aria-hidden="true" />
        </button>
        <button
          type="button"
          className="admin-icon-button"
          aria-label={`Значок соцсети. Сейчас: ${state.text}`}
          aria-expanded={pickerOpen}
          aria-disabled={auto || undefined}
          title={auto ? 'Включите «Вручную», чтобы выбрать значок' : 'Выбрать значок'}
          disabled={disabled || auto}
          onClick={() => setPickerOpen((open) => !open)}
        >
          <BadgeGlyph
            className="admin-icon-button__glyph"
            aria-hidden="true"
            {...(isFilledGlyph(state.glyph) ? {} : { strokeWidth: 1.7 })}
          />
        </button>
        <button
          type="button"
          className="admin-icon-button admin-icon-button--destructive"
          aria-label="Удалить соцсеть"
          disabled={disabled}
          onClick={() => setConfirming(true)}
        >
          <Trash2 className="admin-icon-button__glyph" aria-hidden="true" />
        </button>
      </div>

      {pickerOpen && !auto ? (
        <IconPicker
          title={host ? `Значок для ${host}` : 'Значок для соцсети'}
          options={PICKER_OPTIONS}
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
          title="Удалить соцсеть?"
          confirmLabel="Удалить"
          onConfirm={onDelete}
          onCancel={() => setConfirming(false)}
        >
          <p>Значок будет убран из нижнего ряда страницы.</p>
          <p>Адрес: {link.url || '—'}</p>
        </Dialog>
      ) : null}
    </li>
  );
}
