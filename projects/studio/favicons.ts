/*
  The favicons of the studio, drawn from the Magma mark of @maggioli-design-system/identity, the
  one of its bar (src/shell.tsx), as the docs site draws its own (magma-design-system/docs,
  src/pages/favicons/[file].ts): the SVG for browser tabs, white on a dark scheme; the ICO for the
  browsers without SVG favicons; the touch icon for the home screen of iOS and iPadOS; the
  manifest and its icons for Android and the installed apps.

  The plugin serves them under `favicons/` (the dev server), writes them there into the build and
  links them from the <head> of the studio, relative to the page, so the built studio finds them
  wherever it is mounted (vite.config.ts, `base`). The pages of the frames (scene.html,
  groups.html) are never a tab of their own: no link there.
*/
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import type { Connect, Plugin } from 'vite';

/** The mark of the bar; resolved when a file is drawn, so a config load needs no built identity. */
const logo = () =>
  createRequire(import.meta.url).resolve(
    '@maggioli-design-system/identity/dist/internal/magma-design-system/logo-magma.svg',
  );

const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 };
const WHITE = '#ffffff';

/** The mark, `size` pixels wide, in the middle of a `canvas` square, transparent or on `background`. */
async function png(canvas: number, size = canvas, background?: string): Promise<Buffer> {
  const { default: sharp } = await import('sharp');
  // drawn at four times the size and scaled down, for smoother edges (the mark is 200 px wide)
  const mark = await sharp(readFileSync(logo()), { density: (72 * 4 * size) / 200 })
    .resize(size, size, { fit: 'contain', background: TRANSPARENT })
    .toBuffer();
  return sharp({
    create: { width: canvas, height: canvas, channels: 4, background: background ?? TRANSPARENT },
  })
    .composite([{ input: mark }])
    .png()
    .toBuffer();
}

/** An ICO of PNG images, one per size. */
async function ico(sizes: number[]): Promise<Buffer> {
  const images = await Promise.all(sizes.map((size) => png(size)));
  const header = Buffer.alloc(6 + 16 * images.length);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach((image, i) => {
    const entry = 6 + 16 * i;
    // 0 stands for 256
    header.writeUInt8(sizes[i]! % 256, entry);
    header.writeUInt8(sizes[i]! % 256, entry + 1);
    header.writeUInt16LE(1, entry + 4);
    header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(image.length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += image.length;
  });
  return Buffer.concat([header, ...images]);
}

/** The mark of logo-magma.svg, with the colour of logo-magma-white.svg on a dark scheme. */
const svg = (): string =>
  readFileSync(logo(), 'utf8').replace(
    /<svg[^>]*>/,
    (tag) => `${tag}<style>@media (prefers-color-scheme: dark) { path { fill: ${WHITE} } }</style>`,
  );

/** Paths relative to the manifest, which is in the same folder: `../` is the studio. */
const manifest = {
  name: 'Magma Studio',
  short_name: 'Studio',
  description: 'The studio of Magma, the Maggioli Group Design System',
  start_url: '../',
  background_color: WHITE,
  icons: [
    { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
    { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
};

// The icons of the manifest leave a margin of 1/12 around the mark; the maskable one keeps it in
// the middle half, inside the safe zone of the masks (a circle 80% wide). iOS fills the
// transparent pixels of the touch icon with black: it is on white.
export const FAVICONS: Record<string, { type: string; body: () => string | Promise<Buffer> }> = {
  'favicon.svg': { type: 'image/svg+xml', body: svg },
  'favicon.ico': { type: 'image/x-icon', body: () => ico([16, 32, 48]) },
  'apple-touch-icon.png': { type: 'image/png', body: () => png(180, 120, WHITE) },
  'icon-192.png': { type: 'image/png', body: () => png(192, 160) },
  'icon-512.png': { type: 'image/png', body: () => png(512, 427) },
  'icon-maskable-512.png': { type: 'image/png', body: () => png(512, 256, WHITE) },
  'manifest.webmanifest': {
    type: 'application/manifest+json',
    body: () => JSON.stringify(manifest),
  },
};

/** The links of the <head>: the ICO before the SVG, so the browsers that read both take the SVG. */
const LINKS = [
  { rel: 'icon', href: 'favicon.ico', sizes: '16x16 32x32 48x48' },
  { rel: 'icon', href: 'favicon.svg', type: 'image/svg+xml' },
  { rel: 'apple-touch-icon', href: 'apple-touch-icon.png' },
  { rel: 'manifest', href: 'manifest.webmanifest' },
];

export function studioFavicons(): Plugin {
  const serve: Connect.NextHandleFunction = (req, res, next) => {
    const match = /^\/favicons\/([^/]+)$/.exec(new URL(req.url ?? '/', 'http://studio').pathname);
    const file = match ? FAVICONS[match[1]!] : undefined;
    if (!file) return next();
    Promise.resolve(file.body()).then((body) => {
      res.setHeader('content-type', file.type);
      res.end(body);
    }, next);
  };
  return {
    name: 'studio-favicons',
    configureServer: (server) => {
      server.middlewares.use(serve);
    },
    async generateBundle() {
      for (const [name, file] of Object.entries(FAVICONS))
        this.emitFile({ type: 'asset', fileName: `favicons/${name}`, source: await file.body() });
    },
    // after Vite has processed the page, so it does not resolve the links as assets of the build
    transformIndexHtml: {
      order: 'post',
      handler: (_html, { filename }) =>
        filename.endsWith('index.html')
          ? LINKS.map((attrs) => ({
              tag: 'link',
              attrs: { ...attrs, href: `favicons/${attrs.href}` },
              injectTo: 'head' as const,
            }))
          : [],
    },
  };
}
