import { useState } from 'react';
import { RotateCcw, Save } from 'lucide-react';
import StatusBanner from './StatusBanner';
import Dialog from './Dialog';

/**
 * Console action bar: exactly one primary save action, the reset action and the
 * current save status.
 *
 * @param {Object} props
 * @param {boolean} props.dirty
 * @param {boolean} props.saving
 * @param {boolean} props.loading
 * @param {string | null} props.busyLabel  Pending banner text while loading or saving.
 * @param {object | null} props.status     `{ variant, message }` for the last result.
 * @param {number} props.failureCount
 * @param {() => void} props.onSave
 * @param {() => void} props.onReset
 */
export default function ActionBar({
  dirty,
  saving,
  loading,
  busyLabel,
  status,
  failureCount,
  onSave,
  onReset,
}) {
  const [confirmingReset, setConfirmingReset] = useState(false);
  const canRetry = failureCount > 0 && failureCount < 3;

  return (
    <div className="admin-toolbar" data-component="studio-action-bar">
      <div className="admin-toolbar__row">
        <button
          type="button"
          className="admin-button admin-button--primary"
          onClick={onSave}
          disabled={saving || loading}
        >
          <Save className="admin-button__glyph" aria-hidden="true" />
          {saving ? 'Сохранение…' : 'Сохранить'}
        </button>

        <button
          type="button"
          className="admin-button admin-button--destructive"
          onClick={() => setConfirmingReset(true)}
          disabled={saving || loading}
        >
          <RotateCcw className="admin-button__glyph" aria-hidden="true" />
          Сбросить к значениям по умолчанию
        </button>

        {busyLabel ? (
          <StatusBanner variant="pending" message={busyLabel} />
        ) : status ? (
          <StatusBanner
            variant={status.variant}
            message={status.message}
            details={status.details}
            action={
              status.variant === 'error' && canRetry
                ? { label: 'Повторить', onClick: onSave }
                : status.variant === 'error'
                  ? { label: 'Сообщить об ошибке', onClick: () => {} }
                  : undefined
            }
          />
        ) : dirty ? (
          <StatusBanner variant="warning" message="Есть несохранённые изменения." />
        ) : null}
      </div>

      {confirmingReset ? (
        <Dialog
          title="Сбросить к значениям по умолчанию?"
          confirmLabel="Сбросить"
          onConfirm={() => {
            setConfirmingReset(false);
            onReset();
          }}
          onCancel={() => setConfirmingReset(false)}
        >
          <p>
            Сбросить имя, описание, подпись внизу, картинки, шрифты, цвета и все ссылки к
            значениям по умолчанию?
          </p>
          <p>Текущие правки будут потеряны — в том числе несохранённые.</p>
        </Dialog>
      ) : null}
    </div>
  );
}
