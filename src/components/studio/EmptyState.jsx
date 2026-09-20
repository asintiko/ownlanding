import { Link2, Plus, Users } from 'lucide-react';

const VARIANTS = {
  content: {
    Icon: Link2,
    text: 'Пока нет ни одной ссылки. Добавьте первую — она появится на странице первой в списке.',
    action: 'Добавить ссылку',
  },
  social: {
    Icon: Users,
    text: 'Пока нет ни одной соцсети. Добавьте адрес — значок появится в нижнем ряду страницы.',
    action: 'Добавить соцсеть',
  },
};

/**
 * Recessed empty block shown in place of a collection's rows.
 *
 * @param {Object} props
 * @param {'content'|'social'} props.variant
 * @param {() => void} props.onAdd
 * @param {boolean} props.disabled
 */
export default function EmptyState({ variant, onAdd, disabled }) {
  const { Icon, text, action } = VARIANTS[variant] ?? VARIANTS.content;

  return (
    <div className="admin-empty" data-component="empty-state">
      <Icon className="admin-empty__icon" aria-hidden="true" />
      <p className="admin-empty__text">{text}</p>
      <button
        type="button"
        className="admin-button admin-button--secondary"
        onClick={onAdd}
        disabled={disabled}
      >
        <Plus className="admin-button__glyph" aria-hidden="true" />
        {action}
      </button>
    </div>
  );
}
