import { useEffect, useRef } from 'react';

/**
 * Modal confirmation. It names the exact target, traps nothing it should not,
 * closes on Escape, and returns focus to the control that opened it.
 *
 * @param {Object} props
 * @param {string} props.title
 * @param {React.ReactNode} props.children
 * @param {string} props.confirmLabel
 * @param {string} [props.cancelLabel]
 * @param {() => void} props.onConfirm
 * @param {() => void} props.onCancel
 */
export default function Dialog({
  title,
  children,
  confirmLabel,
  cancelLabel = 'Отмена',
  onConfirm,
  onCancel,
}) {
  const confirmRef = useRef(null);

  useEffect(() => {
    const opener = typeof document !== 'undefined' ? document.activeElement : null;
    confirmRef.current?.focus();

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCancel();
      }
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      if (opener && typeof opener.focus === 'function') opener.focus();
    };
  }, [onCancel]);

  return (
    <div
      className="admin-dialog-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <div
        className="admin-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        data-component="admin-dialog"
      >
        <h2 className="admin-dialog__title">{title}</h2>
        <div className="admin-dialog__body">{children}</div>
        <div className="admin-dialog__actions">
          <button type="button" className="admin-button admin-button--ghost" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            className="admin-button admin-button--destructive-fill"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
