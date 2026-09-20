import StudioPanel from './StudioPanel';
import ColorRow from './ColorRow';
import { THEME_COLOR_GROUPS } from '../../lib/draft';

/**
 * Colour group: every page colour token the console edits, grouped under
 * hairline rules so the group reads as a table.
 *
 * @param {Object} props
 * @param {object} props.theme
 * @param {Record<string, string>} props.errors
 * @param {boolean} props.disabled
 * @param {(key: string, value: string) => void} props.onChange
 */
export default function ThemePanel({ theme, errors, disabled, onChange }) {
  return (
    <StudioPanel
      title="Цвета страницы"
      hint="Правки сразу видны в предпросмотре. Прозрачность задаётся последними двумя знаками, например #FFFFFFD6."
    >
      {THEME_COLOR_GROUPS.map((group) => (
        <div className="admin-group" key={group.id}>
          <p className="admin-row__label">{group.label}</p>
          {group.rows.map((row) => (
            <ColorRow
              key={row.key}
              id={`studio-theme-${row.key}`}
              label={row.label}
              role={row.role}
              value={theme[row.key]}
              disabled={disabled}
              error={errors[`theme.${row.key}`]}
              onChange={(value) => onChange(row.key, value)}
            />
          ))}
        </div>
      ))}
    </StudioPanel>
  );
}
