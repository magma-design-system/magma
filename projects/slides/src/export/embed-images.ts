import { readFileSync } from 'node:fs';
import { isAbsolute, resolve } from 'node:path';

const MIME: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.bmp': 'image/bmp',
};

/** Remote or already-inlined sources are left untouched. */
const isRemote = (src: string): boolean => /^(https?:)?\/\//.test(src) || src.startsWith('data:');

/**
 * Inline local images as `data:` URIs so an exported deck is self-contained.
 * Absolute paths (e.g. a theme's default logo, resolved from the package) are
 * always embedded; relative paths need `baseDir` (the deck file's directory) and
 * are left as-is without it. Remote and `data:` sources pass through. A missing
 * or unknown-type file is left as-is with a warning rather than failing.
 */
export function embedImages(html: string, baseDir?: string): string {
  return html.replace(/src="([^"]+)"/g, (whole, src: string) => {
    if (isRemote(src)) return whole;
    const path = isAbsolute(src) ? src : baseDir ? resolve(baseDir, src) : null;
    if (!path) return whole; // relative source with no baseDir: cannot resolve
    const ext = path.slice(path.lastIndexOf('.')).toLowerCase();
    const mime = MIME[ext];
    if (!mime) return whole;
    try {
      const data = readFileSync(path).toString('base64');
      return `src="data:${mime};base64,${data}"`;
    } catch {
      console.warn(`slides: could not embed image "${src}" (resolved: ${path})`);
      return whole;
    }
  });
}
