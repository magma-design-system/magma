/*
  find_icon: a slug that exists, in the icon sets the project installed. A slug starts with its
  set and each set lives in its own package (agents/assets.md, "Icons"): mi/<variant>/<name>
  from @material-icons/svg (searched with the tags of its data.json), mdi/<name> from @mdi/svg
  (with the aliases and tags of its meta.json), mgg/<name> from svg-icons (by name).

  The slug is what the active iconsauce plugin writes (mds-icon, "2. Pattern.md"), not the name
  of the file in the package: @iconsauce/material-icons spells a Material name with hyphens
  (check_circle/baseline.svg is mi/baseline/check-circle) and serves the variants baseline,
  outline, round and sharp only, so a twotone slug is a 404 there. No Material folder has a
  hyphen, so the two spellings convert one into the other.
*/
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { GAP, GAP_SCHEMA, packageDir, readJsonFile, wordsOf, type ToolContext } from './context.js';
import { ToolError, type Tool } from './protocol.js';

type IconSet = 'mi' | 'mdi' | 'mgg';

const PACKAGES: Record<IconSet, { name: string; svg: string }> = {
  mi: { name: '@material-icons/svg', svg: 'svg' },
  mdi: { name: '@mdi/svg', svg: 'svg' },
  mgg: { name: '@maggioli-design-system/svg-icons', svg: 'dist/svg' },
};

/** The Material variants a slug can name: the ones @iconsauce/material-icons serves. */
const MI_VARIANTS = ['baseline', 'outline', 'round', 'sharp'];

/** `check_circle` (the folder of @material-icons/svg) -> `check-circle` (the slug). */
const miSlugName = (folder: string): string => folder.replace(/_/g, '-');
/** `check-circle` (the slug) -> `check_circle` (the folder). */
const miFolder = (name: string): string => name.replace(/-/g, '_');

interface Icon {
  set: IconSet;
  /** As the slug spells it: `check-circle`, not the `check_circle` of its folder. */
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
        name: miSlugName(name),
        words: tags.map((tag) => tag.toLowerCase()),
      }));
    return readdirSync(folder).map((name) => ({ set, name: miSlugName(name), words: [] }));
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
  // an underscore is the folder's spelling, which no slug served by iconsauce has
  if (set === 'mi' && rest.length === 2)
    return MI_VARIANTS.includes(rest[0]!) && !rest[1]!.includes('_')
      ? path.join(folder, miFolder(rest[1]!), `${rest[0]}.svg`)
      : undefined;
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
        enum: MI_VARIANTS,
        description:
          'The Material Icons variant of the slugs found: baseline (default), outline, round, sharp.',
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
      gap: GAP_SCHEMA,
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
    if (!MI_VARIANTS.includes(miVariant))
      throw new ToolError(
        `"${miVariant}" is not a Material Icons variant a slug can name: ${MI_VARIANTS.join(', ')}.`,
      );
    const slugOf = (icon: Icon) =>
      icon.set === 'mi' ? `mi/${miVariant}/${icon.name}` : `${icon.set}/${icon.name}`;

    if (typeof slug === 'string' && slug) {
      const own = slug.split('/')[0] as IconSet;
      const folder = PACKAGES[own] ? (folders.get(own) ?? folderOf(context, own)) : undefined;
      const file = folder && fileOf(folder, slug);
      const exists = Boolean(file && existsSync(file));
      // when it does not exist, the icons of the same name in the installed sets, in the
      // variant the slug asked for; an underscore (the folder's spelling) reads as a hyphen
      const parts = slug.split('/');
      const name = miSlugName(parts.pop()!);
      const asked = own === 'mi' && MI_VARIANTS.includes(parts[1]!) ? parts[1]! : miVariant;
      const near = exists
        ? []
        : sets
            .flatMap((one) => {
              const dir = folders.get(one);
              return dir
                ? iconsOf(context, one, dir).filter(
                    (icon) => icon.name.includes(name) || name.includes(icon.name),
                  )
                : [];
            })
            .sort((a, b) => Number(b.name === name) - Number(a.name === name));
      return {
        sets: status,
        exists,
        icons: near.slice(0, 12).map((icon) => ({
          slug: icon.set === 'mi' ? `mi/${asked}/${icon.name}` : slugOf(icon),
          set: icon.set,
          name: icon.name,
        })),
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
    const icons = scored
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score || a.icon.name.length - b.icon.name.length)
      .slice(0, typeof limit === 'number' && limit > 0 ? limit : 12)
      .map(({ icon }) => ({ slug: slugOf(icon), set: icon.set, name: icon.name }));
    // with no set installed the gap is the project's, which `sets` already says
    const searched = status.some((one) => one.installed);
    return { sets: status, icons, ...(searched && !icons.length ? { gap: GAP } : {}) };
  },
});
