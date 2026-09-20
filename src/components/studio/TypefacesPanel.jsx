import StudioPanel from './StudioPanel';
import TypefaceChooser from './TypefaceChooser';
import { BODY_FONT_OPTIONS, DISPLAY_FONT_OPTIONS } from '../../lib/fontOptions';

/**
 * Typeface group: the two families the public page renders.
 *
 * @param {Object} props
 * @param {object} props.theme
 * @param {Record<string, string>} props.errors
 * @param {object} props.profile
 * @param {boolean} props.disabled
 * @param {(key: string, value: string) => void} props.onChange
 */
export default function TypefacesPanel({ theme, errors, profile, disabled, onChange }) {
  const nameText = String(profile.name ?? '').trim() || 'Katy Delma';
  const bodyText = String(profile.bio ?? '').trim() || 'Пример текста';

  return (
    <StudioPanel
      title="Шрифты страницы"
      hint="Только системные шрифты: ничего не загружается из интернета, все варианты поддерживают кириллицу."
    >
      <div className="admin-group">
        <TypefaceChooser
          groupLabel="Шрифт имени на странице"
          label="Шрифт имени"
          options={DISPLAY_FONT_OPTIONS}
          value={theme.fontDisplay}
          specimenText={nameText}
          specimenSize={20}
          specimenWeight={600}
          disabled={disabled}
          onChange={(key) => onChange('fontDisplay', key)}
        />

        <TypefaceChooser
          groupLabel="Шрифт текста на странице"
          label="Шрифт текста"
          options={BODY_FONT_OPTIONS}
          value={theme.fontBody}
          specimenText={bodyText}
          specimenSize={14}
          specimenWeight={400}
          disabled={disabled}
          onChange={(key) => onChange('fontBody', key)}
        />

        {errors['theme.fontDisplay'] || errors['theme.fontBody'] ? (
          <p className="admin-field__error" role="alert">
            {errors['theme.fontDisplay'] ?? errors['theme.fontBody']}
          </p>
        ) : null}
      </div>
    </StudioPanel>
  );
}
