/*
  The cover of the studio, `public/covers/og-1200x630.png`: the image a link to it shows on other
  sites (index.html, `og:image`), taken from the studio itself, as the docs site takes its covers
  from its own pages (magma-design-system/docs, `npm run screenshots`). `nx run studio:cover`
  builds the studio, serves the build as `vite preview` does (vendor.ts serves the installed
  Magma beside it) and takes a view at 1200 by 630, the size of an Open Graph image, in the
  Playwright Chromium. The motion is reduced, so a stepper or a skeleton is taken still.

  A recipe is a view of the studio: `tsx cover.ts [recipe] [file]` takes another one, or writes
  somewhere else, to compare them before one becomes the cover. The default is the Palette on the
  first accent, the ramps of a colour in light and dark with the verdict of the contrast gate,
  which says what the studio does at the size of a preview in a feed; the Theme section reads as
  any page of a product there, grey, and in both modes the stepper of the scene, centred in half
  the width, loses its first step (2026-11-06). Take it again when the studio changes the way it
  looks.
*/
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, type Page } from 'playwright';
import { preview } from 'vite';

const root = fileURLToPath(new URL('.', import.meta.url));

/** The size of an Open Graph image, which LinkedIn, Facebook and Slack show whole. */
const SIZE = { width: 1200, height: 630 };

/** The frames of the Theme section have loaded their page, its components and its fonts. */
async function framesReady(page: Page) {
  await page.waitForFunction(() =>
    [...document.querySelectorAll<HTMLIFrameElement>('iframe.studio-scene')].every(
      (frame) => frame.contentDocument?.readyState === 'complete',
    ),
  );
  for (const frame of page.frames().filter((one) => one !== page.mainFrame())) {
    await frame.waitForLoadState('networkidle');
    await frame.locator('mds-card[hydrated]').first().waitFor();
    await frame.evaluate(() => document.fonts.ready.then(() => undefined));
  }
}

/** Chooses a mode of the frames in the dropdown of the preferences, and closes it. */
async function chooseMode(page: Page, mode: 'light' | 'dark' | 'both') {
  await page.locator('#studio-axis-preferences').click();
  await page.locator(`mds-tab[aria-label="Mode"] mds-tab-item[value="${mode}"]`).click();
  await page.keyboard.press('Escape');
  await page
    .locator('mds-dropdown[visible]')
    .waitFor({ state: 'detached' })
    .catch(() => {});
}

const RECIPES: Record<string, { hash: string; set?: (page: Page) => Promise<void> }> = {
  // the default: the ramps of the first accent of the palette, light and dark
  palette: {
    hash: '#/colors/palette',
    set: async (page) => {
      await page.getByText('primary', { exact: true }).first().click();
    },
  },
  // a theme on a page of a product, light and dark side by side
  'theme-both': {
    hash: '#/theme',
    set: async (page) => {
      await chooseMode(page, 'both');
      await framesReady(page);
    },
  },
  'theme-light': { hash: '#/theme', set: framesReady },
  'theme-dark': {
    hash: '#/theme',
    set: async (page) => {
      await chooseMode(page, 'dark');
      await framesReady(page);
    },
  },
};

export async function takeCover(recipe = 'palette', file = 'public/covers/og-1200x630.png') {
  const shot = RECIPES[recipe];
  if (!shot) throw new Error(`no recipe ${recipe}: ${Object.keys(RECIPES).join(', ')}`);
  const out = path.resolve(root, file);
  const server = await preview({
    root,
    configFile: path.join(root, 'vite.config.ts'),
    logLevel: 'warn',
    preview: { port: 4190, strictPort: false },
  });
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext({
      viewport: SIZE,
      deviceScaleFactor: 1,
      reducedMotion: 'reduce',
      colorScheme: 'light',
    });
    const page = await context.newPage();
    await page.goto(`${server.resolvedUrls!.local[0]}${shot.hash}`, { waitUntil: 'networkidle' });
    await page.locator('mds-header-bar[hydrated]').waitFor();
    await page.evaluate(() => document.fonts.ready.then(() => undefined));
    await shot.set?.(page);
    // the last layout of the components once the fonts are in; no pointer over the page, no focus
    // ring on the control a recipe used
    await page.mouse.move(0, SIZE.height - 1);
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
    await page.waitForTimeout(500);
    mkdirSync(path.dirname(out), { recursive: true });
    await page.screenshot({ path: out });
    return out;
  } finally {
    await browser.close();
    await server.close();
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [recipe, file] = process.argv.slice(2);
  console.log(`cover: ${await takeCover(recipe, file)}`);
}
