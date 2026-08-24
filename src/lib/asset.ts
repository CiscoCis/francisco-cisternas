/**
 * Prefix a path in /public with the deployment base path.
 *
 * Next rewrites routes and next/image sources for `basePath`, but plain
 * <img src="/images/…"> is left alone — so anything we reference by hand has
 * to go through here, or it 404s when the site is served from a sub-path
 * (e.g. GitHub Pages project repos at username.github.io/repo-name/).
 */
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export function asset(path: string): string {
  return `${BASE}${path}`;
}

export default asset;
