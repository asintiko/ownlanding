import { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { ICON_GROUPS, searchIcons } from '../../lib/iconCatalog.js';
import { resolveContentIcon } from '../icons/glyphs.jsx';

/**
 * Grouped, searchable chooser over the whole content-icon catalogue. It expands
 * inline inside the row that owns it — never a modal, never a floating popover.
 *
 * @param {Object} props
 * @param {string} props.title
 * @param {string} props.value
 * @param {(key: string) => void} props.onSelect
 * @param {() => void} props.onClose
 * @param {boolean} [props.disabled]
 */
export default function IconCatalogPicker({ title, value, onSelect, onClose, disabled = false }) {
  const [query, setQuery] = useState('');
  const trimmed = query.trim();

  const groups = useMemo(() => {
    if (!trimmed) return ICON_GROUPS;
    const hits = new Set(searchIcons(trimmed).map((icon) => icon.key));
    return ICON_GROUPS.map((group) => ({
      ...group,
      icons: group.icons.filter((icon) => hits.has(icon.key)),
    })).filter((group) => group.icons.length > 0);
  }, [trimmed]);

  const total = groups.reduce((sum, group) => sum + group.icons.length, 0);

  return (
    <div className="admin-picker admin-picker--catalog" role="group" aria-label={title} data-component="icon-catalog">
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

      <label className="admin-picker__search">
        <Search className="admin-picker__search-glyph" aria-hidden="true" />
        <input
          type="search"
          className="admin-field__control admin-picker__search-input"
          placeholder="Поиск: карта, камера, подарок…"
          value={query}
          disabled={disabled}
          aria-label="Поиск значка"
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>

      {total === 0 ? (
        <p className="admin-picker__empty">
          По запросу «{trimmed}» ничего не найдено. Попробуйте другое слово — например «ссылка».
        </p>
      ) : (
        groups.map((group) => (
          <div className="admin-picker__group" key={group.id}>
            <p className="admin-picker__group-label">
              {group.label}
              <span className="admin-picker__group-count">{group.icons.length}</span>
            </p>
            <div className="admin-picker__grid">
              {group.icons.map(({ key, label }) => {
                const Glyph = resolveContentIcon(key);
                const selected = key === value;
                return (
                  <button
                    key={key}
                    type="button"
                    className={`admin-picker__option${selected ? ' admin-picker__option--selected' : ''}`}
                    aria-pressed={selected}
                    aria-label={label}
                    title={label}
                    disabled={disabled}
                    onClick={() => onSelect(key)}
                  >
                    <Glyph className="admin-picker__glyph" aria-hidden="true" strokeWidth={1.7} />
                  </button>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
