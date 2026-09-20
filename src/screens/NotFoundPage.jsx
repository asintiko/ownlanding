import { Link } from 'react-router-dom';

/** Designed catch-all for unknown URLs. */
export default function NotFoundPage() {
  return (
    <main className="not-found" data-component="not-found-page">
      <h1 className="not-found__title">This trail ends here</h1>
      <p className="not-found__text">
        The page you were looking for is not part of this link page. Head back to the links.
      </p>
      <Link className="not-found__link" to="/">
        All links
      </Link>
    </main>
  );
}
