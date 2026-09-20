import Link from 'next/link';

const sections = [
  { href: '/admin/globals/site', title: 'Изменить сайт', text: 'Имя, описание, фото, кнопки и цвета. Здесь можно изменить всё, что видно на сайте.', action: 'Открыть редактор' },
  { href: '/admin/collections/media', title: 'Фото и файлы', text: 'Посмотреть загруженные изображения или добавить новые.', action: 'Открыть файлы' },
  { href: '/admin/collections/users', title: 'Кто может редактировать', text: 'Добавить администратора или изменить данные для входа.', action: 'Настроить доступ' },
];

export function Dashboard() {
  return (
    <section className="waka-dashboard">
      <div className="waka-dashboard__intro">
        <div><h1>Что хотите изменить?</h1><p className="waka-dashboard__description">Начните с редактора сайта. Изменения можно проверить перед публикацией.</p></div>
        <a href="/" target="_blank" rel="noreferrer" className="waka-dashboard__site-link">Посмотреть сайт ↗</a>
      </div>
      <div className="waka-dashboard__sections">
        {sections.map((section) => <Link className="waka-dashboard__section" href={section.href} key={section.href}><h2>{section.title}</h2><p>{section.text}</p><span className="waka-dashboard__action">{section.action} <span aria-hidden="true">→</span></span></Link>)}
      </div>
      <p className="waka-dashboard__hint">Чтобы изменения появились на сайте, нажмите «Опубликовать изменения» в редакторе.</p>
    </section>
  );
}
