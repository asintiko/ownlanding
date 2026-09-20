/**
 * Simplified monochrome brand marks for platforms that are not shipped by the
 * icon library used in this project. Both are drawn as single filled shapes so
 * they sit at the same visual weight as the outline marks beside them.
 */

export function TikTokGlyph({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M14.2 2.6h2.7c.2 2 1.4 3.4 3.3 3.7v2.7c-1.2.1-2.3-.2-3.4-.8v5.7a5.7 5.7 0 1 1-5.7-5.7c.3 0 .6 0 .9.1v2.8a2.9 2.9 0 1 0 2.2 2.8V2.6Z" />
    </svg>
  );
}

export function XGlyph({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M6.1 3h3.3l3.5 4.8L16.9 3h1.8l-5 6.3L20 21h-3.3l-3.8-5.2L8.1 21H6.3l5.4-6.8L6.1 3Z" />
    </svg>
  );
}
