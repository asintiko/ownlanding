import { useRef } from 'react';
import { AlertTriangle } from 'lucide-react';
import { isHexColor, normalizeHexColor } from '../../lib/platformDetect';

/** The first six digits of a value, for the native colour input. */
function opaquePart(value) {
  const normalized = normalizeHexColor(value);
  return normalized ? normalized.slice(0, 7) : '#FFFFFF';
}

/**
 * One editable page colour token: swatch, Russian name, hex value and the role
 * it paints. The swatch keeps showing the last valid colour while a value is
 * being typed, so the preview never flashes an undefined colour.
 *
 * @param {Object} props
 * @param {string} props.id
 * @param {string} props.label
 * @param {string} props.role
 * @param {string} props.value
 * @param {(value: string) => void} props.onChange
 * @param {string} [props.error]
 * @param {boolean} [props.disabled]
 */
export default function ColorRow({ id, label, role, value, onChange, error, disabled = false }) {
  const lastValid = useRef(opaquePart(value));
  if (isHexColor(value)) lastValid.current = opaquePart(value);

  const errorId = `${id}-error`;

  return (
    <div className="admin-color-row">
      <span className="admin-color-row__swatch-wrap">
        <span
          className="admin-color-row__swatch"
          style={{ backgroundColor: lastValid.current }}
          aria-hidden="true"
        />
        <input
          type="color"
          className="admin-color-row__native"
          value={lastValid.current}
          disabled={disabled}
          aria-label={`Выбрать цвет: ${label}`}
          onChange={(event) => onChange(event.target.value.toUpperCase())}
        />
      </span>

      <div className="admin-color-row__meta">
        <label className="admin-row__label" htmlFor={id}>
          {label}
        </label>
        <p className="admin-row__role">{role}</p>
        <input
          id={id}
          className={`admin-color-row__input${error ? ' admin-color-row__input--invalid' : ''}`}
          type="text"
          value={value}
          spellCheck="false"
          disabled={disabled}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? errorId : undefined}
          onChange={(event) => onChange(event.target.value.toUpperCase())}
        />
        {error ? (
          <p className="admin-field__error" id={errorId} role="alert">
            <AlertTriangle className="admin-field__error-glyph" aria-hidden="true" />
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
