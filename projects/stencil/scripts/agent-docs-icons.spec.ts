import { execSync } from 'child_process';
import fs from 'fs';
import { createRequire } from 'module';
import path from 'path';
import { beforeAll, describe, expect, it } from 'vitest';

/**
 * The icon routes of `docs/agents/assets.md` section 3, run as the guide writes them. The guides
 * once documented a copy that served no icon at all (#863) and nothing ever ran it: here every
 * route has to put each slug at `public/svg/<slug>.svg`, the file `mds-icon` fetches with the
 * path `/svg/`, with the bytes of the package file the guide's table names.
 */

const PROJECT_DIR = path.resolve(import.meta.dirname, '..');
const WORKSPACE_ROOT = path.resolve(PROJECT_DIR, '../..');
const ASSETS_MD = path.join(WORKSPACE_ROOT, 'docs/agents/assets.md');
// inside the workspace, so the fixtures resolve the icon packages from its node_modules
const FIXTURES_DIR = path.join(PROJECT_DIR, '.build/agent-docs-icons');

const require = createRequire(import.meta.url);
const packageDir = (pkg: string): string => path.dirname(require.resolve(`${pkg}/package.json`));

/** The file of a slug in its package, per the table of the guide: check-circle is check_circle/. */
const packageFile = (slug: string): string => {
  const [set, ...rest] = slug.split('/');
  if (set === 'mi')
    return path.join(
      packageDir('@material-icons/svg'),
      'svg',
      rest[1].replaceAll('-', '_'),
      `${rest[0]}.svg`,
    );
  if (set === 'mdi') return path.join(packageDir('@mdi/svg'), 'svg', `${rest[0]}.svg`);
  return path.join(packageDir('@maggioli-design-system/svg-icons'), 'dist/svg', `${rest[0]}.svg`);
};

/** The fenced code blocks of the guide, in order. */
const blocks = (): { lang: string; body: string }[] =>
  [...fs.readFileSync(ASSETS_MD, 'utf8').matchAll(/```(\w*)\n([\s\S]*?)```/g)].map(
    ([, lang, body]) => ({ lang, body }),
  );

/** The one block of the guide that `match` picks. */
const block = (description: string, match: (lang: string, body: string) => boolean): string => {
  const found = blocks().filter(({ lang, body }) => match(lang, body));
  if (found.length !== 1) {
    throw new Error(`assets.md: expected one block with ${description}, found ${found.length}`);
  }
  return found[0].body;
};

/** The `icons` script of a `"scripts": { ... }` block, run as npm would. */
const runIconsScript = (scriptsBlock: string, cwd: string): void => {
  const { scripts } = JSON.parse(`{${scriptsBlock}}`) as { scripts: Record<string, string> };
  expect(scripts.predev).toBe('npm run icons');
  expect(scripts.prebuild).toBe('npm run icons');
  execSync(scripts.icons, {
    cwd,
    env: {
      ...process.env,
      PATH: `${path.join(WORKSPACE_ROOT, 'node_modules/.bin')}${path.delimiter}${process.env.PATH}`,
    },
    stdio: 'pipe',
  });
};

const fixture = (name: string): string => {
  const dir = path.join(FIXTURES_DIR, name);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  return dir;
};

const expectServed = (dir: string, slugs: string[]): void => {
  for (const slug of slugs) {
    const served = path.join(dir, 'public/svg', `${slug}.svg`);
    expect(fs.existsSync(served), `${slug} is not at public/svg/${slug}.svg`).toBe(true);
    expect(fs.readFileSync(served)).toEqual(fs.readFileSync(packageFile(slug)));
  }
};

describe('the icon routes of agents/assets.md', () => {
  let slugs: string[];

  beforeAll(() => {
    slugs = JSON.parse(
      block('the icons.json example', (lang, body) => lang === 'json' && body.startsWith('["')),
    );
  });

  it('names one icon of every set in its example, and a multi-word Material one', () => {
    expect(new Set(slugs.map((slug) => slug.split('/')[0]))).toEqual(new Set(['mi', 'mdi', 'mgg']));
    // the slug spells check_circle/ with a hyphen: a one-word example hides the conversion
    expect(slugs.some((slug) => /^mi\/[a-z]+\/[a-z0-9]+-/.test(slug))).toBe(true);
  });

  it('serves every slug with the copy script', () => {
    const dir = fixture('copy-script');
    fs.mkdirSync(path.join(dir, 'scripts'));
    fs.writeFileSync(
      path.join(dir, 'scripts/copy-icons.mjs'),
      block(
        'the copy script',
        (lang, body) => lang === 'js' && body.startsWith('// scripts/copy-icons.mjs'),
      ),
    );
    fs.writeFileSync(path.join(dir, 'icons.json'), JSON.stringify(slugs));

    runIconsScript(
      block(
        'the scripts of the copy script',
        (lang, body) => lang === 'json' && body.includes('copy-icons.mjs'),
      ),
      dir,
    );

    expectServed(dir, slugs);
  });

  it('copies every icon under the slug iconsauce would write, without icons.json', () => {
    const dir = fixture('copy-script-all');
    fs.mkdirSync(path.join(dir, 'scripts'));
    fs.writeFileSync(
      path.join(dir, 'scripts/copy-icons.mjs'),
      block(
        'the copy script',
        (lang, body) => lang === 'js' && body.startsWith('// scripts/copy-icons.mjs'),
      ),
    );
    execSync('node scripts/copy-icons.mjs', { cwd: dir, stdio: 'pipe' });

    const mi = path.join(dir, 'public/svg/mi');
    expect(fs.readdirSync(mi).sort()).toEqual(['baseline', 'outline', 'round', 'sharp']);
    const names = fs.readdirSync(path.join(mi, 'baseline'));
    expect(names).toContain('check-circle.svg');
    expect(names.filter((name) => name.includes('_'))).toEqual([]);
    expectServed(dir, ['mi/sharp/check-circle', 'mdi/github', 'mgg/abitazione-principale']);
    fs.rmSync(dir, { recursive: true, force: true });
  }, 60_000);

  it('serves every slug a page names with iconsauce', () => {
    const dir = fixture('iconsauce');
    fs.writeFileSync(
      path.join(dir, 'iconsauce.config.mjs'),
      block(
        'the iconsauce config',
        (lang, body) => lang === 'js' && body.startsWith('// iconsauce.config.mjs'),
      ),
    );
    fs.writeFileSync(
      path.join(dir, 'index.html'),
      slugs.map((slug) => `<mds-icon name="${slug}"></mds-icon>`).join('\n'),
    );

    runIconsScript(
      block(
        'the scripts of iconsauce',
        (lang, body) => lang === 'json' && body.includes('iconsauce --config'),
      ),
      dir,
    );

    expectServed(dir, slugs);
  }, 60_000);
});
