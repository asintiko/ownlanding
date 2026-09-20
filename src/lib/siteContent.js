import { cloneDefaultContent } from '../data/defaultContent.js';

/**
 * The content snapshot baked into the bundle when the project is built.
 * Vite injects it from the local SQLite database; if it is ever unavailable the
 * shipped defaults are used so the page can never render empty.
 */
const injected = typeof __SITE_CONTENT__ !== 'undefined' ? __SITE_CONTENT__ : null;

export const bundledContent = injected ?? cloneDefaultContent();
