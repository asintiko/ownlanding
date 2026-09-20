import Link from 'next/link';

export default function NotFound() {
  return <main className="not-found">
    <h1 className="not-found__title">Страница не найдена</h1>
    <p className="not-found__text">Возможно, адрес изменился.</p>
    <Link className="not-found__link" href="/">На главную</Link>
  </main>;
}
