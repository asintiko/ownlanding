import StudioPanel from './StudioPanel';
import UploadField from './UploadField';

/**
 * Image group: the creator avatar and the full-bleed card background.
 *
 * @param {Object} props
 * @param {object} props.profile
 * @param {boolean} props.disabled
 * @param {string | null} props.uploadingField
 * @param {(field: string, file: File) => void} props.onUpload
 */
export default function ImagesPanel({ profile, disabled, uploadingField, onUpload }) {
  return (
    <StudioPanel
      title="Изображения"
      hint="Файлы хранятся локально рядом с файлом базы данных."
    >
      <div className="admin-group">
        <UploadField
          id="studio-avatar"
          label="Фотография профиля"
          value={profile.avatarSrc}
          shape="circle"
          disabled={disabled}
          uploading={uploadingField === 'avatarSrc'}
          role="Круглый портрет в верхней части карточки."
          onUpload={(file) => onUpload('avatarSrc', file)}
        />

        <UploadField
          id="studio-background"
          label="Фон страницы"
          value={profile.backgroundSrc}
          disabled={disabled}
          uploading={uploadingField === 'backgroundSrc'}
          role="Фотография на всю карточку. Поверх неё всегда лежит затемнение, чтобы текст читался."
          onUpload={(file) => onUpload('backgroundSrc', file)}
        />
      </div>
    </StudioPanel>
  );
}
