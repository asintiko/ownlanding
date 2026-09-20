import { Check, ImageIcon } from 'lucide-react';

function formatBytes(bytes) {
  const value = Number(bytes) || 0;
  if (value < 1024) return `${value} Б`;
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} КБ`;
  return `${(value / (1024 * 1024)).toFixed(1)} МБ`;
}

/**
 * Selectable grid of images already stored locally, so the owner can assign an
 * earlier upload to a slot instead of uploading it again.
 *
 * @param {Object} props
 * @param {Array<{path: string, filename: string, bytes: number}>} props.items
 * @param {string} props.currentPath
 * @param {(path: string) => void} props.onSelect
 * @param {string} props.slotLabel
 * @param {boolean} [props.disabled]
 */
export default function MediaGrid({ items, currentPath, onSelect, slotLabel, disabled = false }) {
  if (items.length === 0) {
    return (
      <div className="media-grid media-grid--empty">
        <ImageIcon className="media-grid__empty-icon" aria-hidden="true" />
        <p className="media-grid__empty-text">
          Пока ничего не загружено. Загрузите файл — и он появится здесь, чтобы его можно было
          выбрать позже.
        </p>
      </div>
    );
  }

  return (
    <ul className="media-grid" aria-label={`Загруженные изображения — ${slotLabel}`}>
      {items.map((item) => {
        const current = item.path === currentPath;
        return (
          <li key={item.path} className="media-tile__wrap">
            <button
              type="button"
              className={`media-tile${current ? ' media-tile--current' : ''}`}
              aria-pressed={current}
              aria-label={`${item.filename}, ${formatBytes(item.bytes)}${current ? ' — используется' : ''}`}
              title={item.filename}
              disabled={disabled}
              onClick={() => onSelect(item.path)}
            >
              <img src={item.path} alt="" loading="lazy" />
              {current ? <Check className="media-tile__marker" aria-hidden="true" /> : null}
            </button>
            <p className="media-tile__name">{item.filename}</p>
          </li>
        );
      })}
    </ul>
  );
}
