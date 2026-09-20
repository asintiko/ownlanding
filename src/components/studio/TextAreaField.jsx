import { AlertTriangle } from 'lucide-react';

/**
 * Labelled textarea with a live character counter.
 *
 * @param {Object} props
 * @param {string} props.id
 * @param {string} props.label
 * @param {string} props.value
 * @param {(value: string) => void} props.onChange
 * @param {boolean} [props.required]
 * @param {string} [props.error]
 * @param {string} [props.helper]
 * @param {string} [props.role] Optional description of what the value paints.
 * @param {number} [props.maxLength]
 * @param {boolean} [props.disabled]
 */
export default function TextAreaField({
  id,
  label,
  value,
  onChange,
  required = false,
  error,
  helper,
  role,
  maxLength,
  disabled = false,
}) {
  const errorId = `${id}-error`;
  const helperId = `${id}-helper`;
  const describedBy = [error ? errorId : null, helper && !error ? helperId : null]
    .filter(Boolean)
    .join(' ');

  const length = String(value ?? '').length;
  const overLimit = Boolean(maxLength) && length > maxLength;

  return (
    <div className="admin-row">
      <label className="admin-row__label" htmlFor={id}>
        {label}
        {required ? (
          <span className="admin-field__required" role="img" aria-label="Обязательное поле">
            ∗
          </span>
        ) : null}
      </label>

      <div className="admin-row__value">
        <textarea
          id={id}
          className={`admin-field__textarea${error ? ' admin-field__control--invalid' : ''}`}
          value={value}
          disabled={disabled}
          maxLength={maxLength ? maxLength + 20 : undefined}
          aria-required={required || undefined}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy || undefined}
          onChange={(event) => onChange(event.target.value)}
        />

        {error ? (
          <p className="admin-field__error" id={errorId} role="alert">
            <AlertTriangle className="admin-field__error-glyph" aria-hidden="true" />
            {error}
          </p>
        ) : null}

        {maxLength ? (
          <p className={overLimit ? 'admin-field__error' : 'admin-field__counter'}>
            {overLimit ? (
              <AlertTriangle className="admin-field__error-glyph" aria-hidden="true" />
            ) : null}
            {`${length} / ${maxLength}`}
          </p>
        ) : null}

        {role ? <p className="admin-row__role">{role}</p> : null}

        {helper && !error ? (
          <p className="admin-field__helper" id={helperId}>
            {helper}
          </p>
        ) : null}
      </div>
    </div>
  );
}
