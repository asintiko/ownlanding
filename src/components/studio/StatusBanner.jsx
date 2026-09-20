import { AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';

const VARIANTS = {
  pending: { className: 'admin-banner', Icon: Loader2, role: 'status' },
  success: { className: 'admin-banner admin-banner--success', Icon: CheckCircle2, role: 'status' },
  error: { className: 'admin-banner admin-banner--error', Icon: AlertTriangle, role: 'alert' },
  warning: { className: 'admin-banner admin-banner--warning', Icon: AlertTriangle, role: 'alert' },
  neutral: { className: 'admin-banner', Icon: Loader2, role: 'status' },
};

/**
 * Flat status strip. Every message carries a glyph, a boundary and text, so the
 * state is never communicated by colour alone.
 *
 * @param {Object} props
 * @param {'pending'|'success'|'error'|'warning'|'neutral'} props.variant
 * @param {string} props.message
 * @param {{label: string, onClick: () => void}} [props.action]
 * @param {string[]} [props.details] Extra lines below the message.
 */
export default function StatusBanner({ variant = 'neutral', message, action, details }) {
  if (!message) return null;
  const { className, Icon, role } = VARIANTS[variant] ?? VARIANTS.neutral;

  return (
    <div className={className} role={role} data-component="status-banner">
      <Icon className="admin-banner__icon" aria-hidden="true" />
      <div className="admin-banner__body">
        <p className="admin-banner__message">{message}</p>
        {details && details.length > 0 ? (
          <ul className="admin-banner__details">
            {details.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        ) : null}
      </div>
      {action ? (
        <button
          type="button"
          className="admin-button admin-button--secondary admin-button--compact"
          onClick={action.onClick}
        >
          {action.label}
        </button>
      ) : null}
    </div>
  );
}
