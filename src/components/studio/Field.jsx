import { AlertTriangle } from 'lucide-react';

/**
 * Labelled text field with an inline validation message.
 *
 * Two layouts:
 * - `row`     — a label column plus a value column, used in the identity group
 *               so the panel reads as a table;
 * - `stacked` — the label sits 4px above its control, used inside link rows.
 *
 * @param {Object} props
 * @param {string} props.id
 * @param {string} props.label
 * @param {string} props.value
 * @param {(value: string) => void} props.onChange
 * @param {'row'|'stacked'} [props.variant]
 * @param {boolean} [props.required]
 * @param {string} [props.error]
 * @param {string} [props.helper]
 * @param {string} [props.placeholder]
 * @param {string} [props.type]
 * @param {string} [props.inputMode]
 * @param {number} [props.maxLength]
 * @param {boolean} [props.disabled]
 * @param {boolean} [props.readOnly]
 * @param {string} [props.role] Optional description of what the value paints.
 */
export default function Field({
  id,
  label,
  value,
  onChange,
  variant = 'stacked',
  required = false,
  error,
  helper,
  role,
  placeholder,
  type = 'text',
  inputMode,
  maxLength,
  disabled = false,
  readOnly = false,
}) {
  const errorId = `${id}-error`;
  const helperId = `${id}-helper`;
  const describedBy = [error ? errorId : null, helper && !error ? helperId : null]
    .filter(Boolean)
    .join(' ');

  const labelNode = (
    <>
      {label}
      {required ? (
        <span className="admin-field__required" role="img" aria-label="Обязательное поле">
          ∗
        </span>
      ) : null}
    </>
  );

  const control = (
    <>
      <input
        id={id}
        className={`admin-field__control${error ? ' admin-field__control--invalid' : ''}`}
        type={type}
        value={value}
        placeholder={placeholder}
        inputMode={inputMode}
        maxLength={maxLength}
        disabled={disabled}
        readOnly={readOnly}
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

      {helper && !error ? (
        <p className="admin-field__helper" id={helperId}>
          {helper}
        </p>
      ) : null}
    </>
  );

  if (variant === 'row') {
    return (
      <div className="admin-row">
        <label className="admin-row__label" htmlFor={id}>
          {labelNode}
        </label>
        <div className="admin-row__value">
          {control}
          {role ? <p className="admin-row__role">{role}</p> : null}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-field">
      <label className="admin-field__label" htmlFor={id}>
        {labelNode}
      </label>
      {control}
    </div>
  );
}
