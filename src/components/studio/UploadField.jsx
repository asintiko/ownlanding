import { useRef, useState } from 'react';
import { AlertTriangle, ImagePlus } from 'lucide-react';

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 8 * 1024 * 1024;
const STORAGE_NOTE =
  'JPG, PNG или WEBP до 8 МБ; SVG не принимается. Файл сохраняется локально рядом с файлом базы данных и отдаётся страницей как есть — без облачного хранилища и без внешних ссылок.';

function fileName(path) {
  if (!path) return '';
  const parts = String(path).split('/');
  return parts[parts.length - 1];
}

/**
 * Image upload row: thumbnail, filename and an upload/replace action.
 *
 * @param {Object} props
 * @param {string} props.id
 * @param {string} props.label
 * @param {string} props.value        Public path of the stored image.
 * @param {(file: File) => Promise<void>} props.onUpload
 * @param {'circle'|'square'} [props.shape]
 * @param {string} [props.role] Short description of what the image paints.
 * @param {boolean} [props.disabled]
 * @param {boolean} [props.uploading]
 */
export default function UploadField({
  id,
  label,
  value,
  onUpload,
  shape = 'square',
  role,
  disabled = false,
  uploading = false,
}) {
  const inputRef = useRef(null);
  const [localError, setLocalError] = useState('');
  const [dragging, setDragging] = useState(false);

  const busy = disabled || uploading;

  const accept = async (file) => {
    if (!file) return;
    if (!ACCEPTED.includes(file.type) || file.size > MAX_BYTES) {
      setLocalError('Поддерживаются JPG, PNG, WEBP до 8 МБ.');
      return;
    }
    setLocalError('');
    await onUpload(file);
  };

  const boxClasses = [
    'admin-upload',
    dragging ? 'admin-upload--dragging' : '',
    localError ? 'admin-upload--invalid' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="admin-row">
      <span className="admin-row__label" id={`${id}-label`}>
        {label}
      </span>

      <div className="admin-row__value">
        <div
          className={boxClasses}
          role="group"
          aria-labelledby={`${id}-label`}
          onDragOver={(event) => {
            if (busy) return;
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            if (busy) return;
            accept(event.dataTransfer?.files?.[0]);
          }}
        >
          <span
            className={`admin-upload__thumb${shape === 'circle' ? ' admin-upload__thumb--circle' : ''}${
              uploading ? ' admin-upload__thumb--busy' : ''
            }`}
          >
            {value ? (
              <img src={value} alt="" />
            ) : (
              <ImagePlus className="admin-upload__placeholder" aria-hidden="true" />
            )}
          </span>

          <span className="admin-upload__meta">
            <span className="admin-upload__name">
              {dragging ? 'Отпустите файл' : fileName(value) || 'Файл не выбран'}
            </span>
            <span className="admin-upload__hint">{STORAGE_NOTE}</span>
          </span>

          <button
            type="button"
            className="admin-button admin-button--secondary"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? 'Загрузка…' : value ? 'Заменить' : 'Загрузить'}
          </button>

          <input
            ref={inputRef}
            id={id}
            className="admin-upload__input"
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = '';
              accept(file);
            }}
          />
        </div>

        {role ? <p className="admin-row__role">{role}</p> : null}

        {localError ? (
          <p className="admin-field__error" role="alert">
            <AlertTriangle className="admin-field__error-glyph" aria-hidden="true" />
            {localError}
          </p>
        ) : null}
      </div>
    </div>
  );
}
