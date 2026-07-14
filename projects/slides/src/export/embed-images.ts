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
 * Paths are resolved relative to `baseDir` (the deck file's directory); remote
 * and `data:` sources pass through. A missing or unknown-type file is left as-is
 * with a warning rather than failing the export.
 */
export function embedImages(html: string, baseDir: string): string {
  return html.replace(/src="([^"]+)"/g, (whole, src: string) => {
    if (isRemote(src)) return whole;
    const path = isAbsolute(src) ? src : resolve(baseDir, src);
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
