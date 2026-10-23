/*
  find_icon: a slug that exists, in the icon sets the project installed. A slug starts with its
  set and each set lives in its own package (agents/assets.md, "Icons"): mi/<variant>/<name>
  from @material-icons/svg (searched with the tags of its data.json), mdi/<name> from @mdi/svg
  (with the aliases and tags of its meta.json), mgg/<name> from svg-icons (by name).
*/
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { packageDir, readJsonFile, wordsOf, type ToolContext } from './context.js';
import { ToolError, type Tool } from './protocol.js';

type IconSet = 'mi' | 'mdi' | 'mgg';

const PACKAGES: Record<IconSet, { name: string; svg: string }> = {
  mi: { name: '@material-icons/svg', svg: 'svg' },
  mdi: { name: '@mdi/svg', svg: 'svg' },
  mgg: { name: '@maggioli-design-system/svg-icons', svg: 'dist/svg' },
};

interface Icon {
  set: IconSet;
  name: string;
  /** Searchable words besides the name: tags, aliases. */
  words: string[];
}

/** The svg folder of a set: the setting of the tests, else the installed package. */
const folderOf = (context: ToolContext, set: IconSet): string | undefined => {
  if (context.icons?.[set]) return context.icons[set];
  const dir = packageDir(context, PACKAGES[set].name);
  const folder = dir && path.join(dir, PACKAGES[set].svg);
  return folder && existsSync(folder) ? folder : undefined;
};

const iconsOf = (context: ToolContext, set: IconSet, folder: string): Icon[] => {
  if (set === 'mi') {
    const data = readJsonFile<{ icons: Array<{ name: string; tags?: string[] }> }>(
      path.join(folder, '../data.json'),
    );
    if (data)
      return data.icons.map(({ name, tags = [] }) => ({
        set,
        name,
        words: tags.map((tag) => tag.toLowerCase()),
      }));
    return readdirSync(folder).map((name) => ({ set, name, words: [] }));
  }
  if (set === 'mdi') {
    const meta = readJsonFile<
      Array<{ name: string; aliases?: string[]; tags?: string[]; deprecated?: boolean }>
    >(path.join(folder, '../meta.json'));
    if (meta)
      return meta
        .filter((icon) => !icon.deprecated)
        .map(({ name, aliases = [], tags = [] }) => ({
          set,
          name,
          words: [...aliases, ...tags].map((word) => word.toLowerCase()),
        }));
  }
  return readdirSync(folder)
    .filter((file) => file.endsWith('.svg'))
    .map((file) => ({ set, name: file.slice(0, -4), words: [] }));
};

/** The file a slug is served from, in its package. */
const fileOf = (folder: string, slug: string): string | undefined => {
  const [set, ...rest] = slug.split('/');
  if (set === 'mi' && rest.length === 2) return path.join(folder, rest[1]!, `${rest[0]}.svg`);
  if ((set === 'mdi' || set === 'mgg') && rest.length === 1)
    return path.join(folder, `${rest[0]}.svg`);
  return undefined;
};

export const findIcon = (context: ToolContext): Tool => ({
  name: 'find_icon',
  title: 'Find a Magma icon slug',
  description:
    'Icon slugs that exist in the sets the project installed (mi/<variant>/<name> from @material-icons/svg, mdi/<name> from @mdi/svg, mgg/<name> from svg-icons). Search by meaning ("delete", "send email"), or pass a slug to check that it exists before writing it in icon="...".',
  inputSchema: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'What the icon shows, in words.' },
      slug: { type: 'string', description: 'A slug to check, such as "mi/baseline/send".' },
      set: { type: 'string', enum: ['mi', 'mdi', 'mgg'], description: 'Search one set only.' },
      variant: {
        type: 'string',
        description:
          'The Material Icons variant of the slugs found: baseline (default), outline, round, sharp, twotone.',
      },
      limit: { type: 'number', description: 'How many to return, 12 by default.' },
    },
  },
  outputSchema: {
    type: 'object',
    properties: {
      sets: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            set: { type: 'string' },
            package: { type: 'string' },
            installed: { type: 'boolean' },
          },
          required: ['set', 'package', 'installed'],
        },
      },
      exists: { type: 'boolean' },
      icons: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            slug: { type: 'string' },
            set: { type: 'string' },
            name: { type: 'string' },
          },
          required: ['slug', 'set', 'name'],
        },
      },
    },
    required: ['sets', 'icons'],
  },
  run: ({ query, slug, set, variant, limit }) => {
    const sets = (Object.keys(PACKAGES) as IconSet[]).filter((one) => !set || one === set);
    const folders = new Map(sets.map((one) => [one, folderOf(context, one)]));
    const status = sets.map((one) => ({
      set: one,
      package: PACKAGES[one].name,
      installed: Boolean(folders.get(one)),
    }));
    const miVariant = typeof variant === 'string' && variant ? variant : 'baseline';
    const slugOf = (icon: Icon) =>
      icon.set === 'mi' ? `mi/${miVariant}/${icon.name}` : `${icon.set}/${icon.name}`;

    if (typeof slug === 'string' && slug) {
      const own = slug.split('/')[0] as IconSet;
      const folder = PACKAGES[own] ? (folders.get(own) ?? folderOf(context, own)) : undefined;
      const file = folder && fileOf(folder, slug);
      const exists = Boolean(file && existsSync(file));
      // when it does not exist, the icons of the same name in the installed sets
      const name = slug.split('/').pop()!;
      const near = exists
        ? []
        : sets.flatMap((one) => {
            const dir = folders.get(one);
            return dir
              ? iconsOf(context, one, dir).filter(
                  (icon) => icon.name.includes(name) || name.includes(icon.name),
                )
              : [];
          });
      return {
        sets: status,
        exists,
        icons: near
          .slice(0, 12)
          .map((icon) => ({ slug: slugOf(icon), set: icon.set, name: icon.name })),
      };
    }

    const words = wordsOf(String(query ?? ''));
    if (!words.length)
      throw new ToolError('Give a query (what the icon shows) or a slug to check.');
    const scored = sets.flatMap((one) => {
      const dir = folders.get(one);
      if (!dir) return [];
      return iconsOf(context, one, dir).map((icon) => {
        const parts = icon.name.split(/[-_]/);
        const score = words.reduce(
          (total, word) =>
            total +
            (icon.name === word
              ? 10
              : parts.includes(word)
                ? 5
                : icon.name.includes(word)
                  ? 2
                  : 0) +
            (icon.words.includes(word) ? 2 : icon.words.some((one) => one.includes(word)) ? 1 : 0),
          0,
        );
        return { icon, score };
      });
    });
    return {
      sets: status,
      icons: scored
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score || a.icon.name.length - b.icon.name.length)
        .slice(0, typeof limit === 'number' && limit > 0 ? limit : 12)
        .map(({ icon }) => ({ slug: slugOf(icon), set: icon.set, name: icon.name })),
    };
  },
});
