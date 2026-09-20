import StudioPanel from './StudioPanel';
import Field from './Field';
import TextAreaField from './TextAreaField';
import { BIO_MAX, FOOTER_MAX, NAME_MAX } from '../../lib/draft';

/**
 * Identity group: the display name, the one-line bio and the bottom caption.
 *
 * @param {Object} props
 * @param {object} props.profile
 * @param {Record<string, string>} props.errors
 * @param {boolean} props.disabled
 * @param {(key: string, value: string) => void} props.onChange
 */
export default function IdentityPanel({ profile, errors, disabled, onChange }) {
  return (
    <StudioPanel title="Личные данные" hint="Текст, который посетитель читает первым.">
      <div className="admin-group">
        <Field
          id="studio-name"
          label="Имя"
          variant="row"
          value={profile.name}
          required
          maxLength={NAME_MAX + 10}
          disabled={disabled}
          error={errors['profile.name']}
          placeholder="Например: Katy Delma"
          role="Крупная строка в верхней части карточки."
          onChange={(value) => onChange('name', value)}
        />

        <TextAreaField
          id="studio-bio"
          label="Описание"
          value={profile.bio}
          required
          maxLength={BIO_MAX}
          disabled={disabled}
          error={errors['profile.bio']}
          role="Одна короткая строка под именем."
          onChange={(value) => onChange('bio', value)}
        />

        <Field
          id="studio-footer"
          label="Подпись внизу"
          variant="row"
          value={profile.footerNote}
          maxLength={FOOTER_MAX}
          disabled={disabled}
          error={errors['profile.footerNote']}
          helper="Оставьте пустым, чтобы строки внизу страницы не было."
          role="Мелкая строка под значками соцсетей."
          onChange={(value) => onChange('footerNote', value)}
        />
      </div>
    </StudioPanel>
  );
}
