/**
 * Destination screen header: the Russian title, one line of purpose and the
 * current save state.
 *
 * @param {Object} props
 * @param {string} props.title
 * @param {string} props.purpose
 * @param {boolean} props.dirty
 */
export default function ScreenHeader({ title, purpose, dirty }) {
  return (
    <div className="screen-header" data-component="screen-header">
      <div className="screen-header__text">
        <h1 className="screen-header__title">{title}</h1>
        <p className="screen-header__purpose">{purpose}</p>
      </div>
      <p className={`screen-header__state${dirty ? ' screen-header__state--dirty' : ''}`}>
        {dirty ? 'Не сохранено' : 'Сохранено'}
      </p>
    </div>
  );
}
