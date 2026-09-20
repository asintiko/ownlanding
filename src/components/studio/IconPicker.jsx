import { X } from 'lucide-react';

/**
 * Inline icon chooser, expanded inside the row it belongs to. It is never a
 * modal, never a floating popover and never an overlay that hides the preview.
 *
 * @param {Object} props
 * @param {string} props.title
 * @param {Array<{key: string, label: string, Glyph: Function, filled?: boolean}>} props.options
 * @param {string} props.value
 * @param {(key: string) => void} props.onSelect
 * @param {() => void} props.onClose
 * @param {boolean} [props.disabled]
 */
export default function IconPicker({ title, options, value, onSelect, onClose, disabled = false }) {
  return (
    <div className="admin-picker" role="group" aria-label={title} data-component="icon-picker">
      <div className="admin-picker__head">
        <p className="admin-picker__title">{title}</p>
        <button
          type="button"
          className="admin-icon-button"
          onClick={onClose}
          disabled={disabled}
          aria-label="Закрыть выбор значка"
        >
          <X className="admin-icon-button__glyph" aria-hidden="true" />
        </button>
      </div>

      <div className="admin-picker__grid">
        {options.map(({ key, label, Glyph, filled }) => {
          const selected = key === value;
          return (
            <button
              key={key}
              type="button"
              className={`admin-picker__option${
                selected ? ' admin-picker__option--selected' : ''
              }`}
              aria-pressed={selected}
              aria-label={label}
              title={label}
              disabled={disabled}
              onClick={() => onSelect(key)}
            >
              <Glyph
                className="admin-picker__glyph"
                aria-hidden="true"
                {...(filled ? {} : { strokeWidth: 1.7 })}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
