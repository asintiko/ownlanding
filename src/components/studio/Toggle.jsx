/**
 * Rectangular switch inside a labelled row whose full 44px height is clickable,
 * so the control keeps a 44×44 target while staying compact. On and off differ
 * by fill, knob position and the adjacent state word — never by colour alone.
 *
 * @param {Object} props
 * @param {string} props.label
 * @param {string} props.onState
 * @param {string} props.offState
 * @param {boolean} props.checked
 * @param {(next: boolean) => void} props.onChange
 * @param {boolean} [props.disabled]
 */
export default function Toggle({ label, onState, offState, checked, onChange, disabled = false }) {
  return (
    <button
      type="button"
      className="admin-toggle-row"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
    >
      <span className="admin-toggle-row__label">
        {label}
        <span className="admin-toggle-row__state">{checked ? onState : offState}</span>
      </span>
      <span className={`admin-toggle${checked ? ' admin-toggle--on' : ''}`} aria-hidden="true">
        <span className="admin-toggle__knob" />
      </span>
    </button>
  );
}
