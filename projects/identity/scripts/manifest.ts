import chalk from 'chalk';
import { mkdir, readdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { logFileSavedTo } from '../../../scripts/log';
import { DIST_DIR } from './meta';

/*
  dist/identity.json: what a consumer would otherwise guess from the file names. One entry per
  family of artworks (all the variants of one brand), with its name as the artwork writes it,
  its owner, its kind, its product line, and every variant with its form, colour, the
  background it is drawn for and its size.

  The facts that a file name cannot carry are written by hand next to the artworks, one
  `identity.meta.json` per owner folder of resources/ (and one for the avatars): the owner,
  the families with their names and their files, the product lines. The build derives the
  rest from the files and checks the two against each other: an SVG that no family lists, a
  listed file that does not exist, a family or an owner defined twice, a line or an owner a
  family names but nobody defines, all stop it.

  Descriptions and usage rules (clear space, minimum size) are not here yet: they have to come
  from the brand guidelines, not from the files.
*/

const RESOURCES_DIR = path.resolve(__dirname, '../resources');
const META_FILE = 'identity.meta.json';
const OUT_FILE = 'identity.json';

/** The folders of dist/, in the order the manifest lists them. */
const GROUPS = ['brand', 'products', 'avatar', 'illustrations', 'internal'] as const;
/** The widths build.ts renders the PNG and WebP files at. */
const RASTER_WIDTHS = [256, 512, 1024];
/** Colour variants, in order; no suffix is `color`. */
const COLORS = ['color', 'blue', 'gold', 'dark-gold', 'black', 'white'] as const;
/** Forms of a logo, in order. */
const FORMS = ['logo', 'bordered', 'symbol'] as const;
const COLOR_SUFFIX = /-(dark-gold|gold|blue|black|white)(?=-|$)/;

type Kind = 'logo' | 'avatar' | 'illustration';
type Color = (typeof COLORS)[number];
type Form = (typeof FORMS)[number];
type Background = 'light' | 'dark' | 'any';

/** A file of a family in a meta file: its path, or the path with what its name gets wrong. */
type MetaFile = string | { file: string; form?: Form; color?: Color; background?: Background };

interface MetaFamily {
  id: string;
  name: string;
  /** default: `avatar` in avatar/, `illustration` in illustrations/, `logo` elsewhere */
  kind?: Kind;
  /** the owner id, when the folder has none (avatar/) or another one */
  owner?: string;
  /** a key of `lines` in the same meta file */
  line?: string;
  /** paths relative to the meta file, without the extension */
  files: MetaFile[];
}

interface Meta {
  owner?: { id: string; name: string };
  lines?: Record<string, string>;
  families: MetaFamily[];
}

interface Variant {
  /** path in dist/, without the extension: add `.svg`, `.pdf`, `-<width>w.png`, `-<width>w.webp` */
  path: string;
  /** only for logos: the whole logo, the logo on its border, or the symbol without the name */
  form?: Form;
  color: Color;
  /** the background the variant is drawn for */
  background: Background;
  /** from the viewBox of the SVG, so a page can reserve the space before the image loads */
  width: number;
  height: number;
}

interface Asset {
  id: string;
  name: string;
  kind: Kind;
  group: (typeof GROUPS)[number];
  owner: { id: string; name: string };
  line?: { id: string; name: string };
  variants: Variant[];
  formats: { svg: true; pdf: true; png: number[]; webp: number[] };
}

const walk = async (dir: string): Promise<string[]> =>
  (
    await Promise.all(
      (await readdir(dir, { withFileTypes: true })).map((entry) =>
        entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)],
      ),
    )
  ).flat();

/** What a file name says: the form (for a logo) and the colour. */
const parseName = (stem: string, kind: Kind): { form?: Form; color: Color } => {
  let rest = stem;
  let form: Form = 'logo';
  const prefix = /^(logo|icon|avatar)-/.exec(rest)?.[1];
  if (prefix) rest = rest.slice(prefix.length + 1);
  if (prefix === 'icon') form = 'symbol';
  const color = (COLOR_SUFFIX.exec(rest)?.[1] ?? 'color') as Color;
  rest = rest.replace(COLOR_SUFFIX, '');
  if (/-(no-text|icon)$/.test(rest)) form = 'symbol';
  else if (/-bordered$/.test(rest)) form = 'bordered';
  return kind === 'logo' ? { form, color } : { color };
};

/** Black is drawn for light backgrounds and white for dark ones; the rest for light ones. */
const backgroundOf = (color: Color): Background => (color === 'white' ? 'dark' : 'light');

const svgSize = (svg: string): { width: number; height: number } => {
  const box = /viewBox="([^"]+)"/.exec(svg)?.[1];
  const [, , width, height] = (box ?? '').split(/[\s,]+/).map(Number);
  return { width: width || 0, height: height || 0 };
};

const main = async (): Promise<void> => {
  const files = await walk(RESOURCES_DIR);
  const svgs = new Set(
    files
      .filter((file) => file.endsWith('.svg'))
      .map((file) => path.relative(RESOURCES_DIR, file).replace(/\.svg$/, '')),
  );
  const metas = await Promise.all(
    files
      .filter((file) => path.basename(file) === META_FILE)
      .sort()
      .map(async (file) => ({
        dir: path.relative(RESOURCES_DIR, path.dirname(file)),
        meta: JSON.parse(await readFile(file, 'utf8')) as Meta,
      })),
  );

  const problems: string[] = [];
  const owners = new Map<string, string>();
  for (const { dir, meta } of metas) {
    if (!meta.owner) continue;
    const known = owners.get(meta.owner.id);
    if (known !== undefined && known !== meta.owner.name)
      problems.push(`${dir}: owner ${meta.owner.id} is "${known}" elsewhere`);
    owners.set(meta.owner.id, meta.owner.name);
  }

  const listed = new Map<string, string>();
  const ids = new Set<string>();
  const assets: Asset[] = [];
  for (const { dir, meta } of metas) {
    const group = dir.split(path.sep)[0] as Asset['group'];
    if (!GROUPS.includes(group)) problems.push(`${dir}: not under ${GROUPS.join(', ')}`);
    for (const family of meta.families) {
      const where = `${dir}/${META_FILE} ${family.id}`;
      if (ids.has(family.id)) problems.push(`${where}: the id is used by another family`);
      ids.add(family.id);
      const ownerId = family.owner ?? meta.owner?.id;
      const ownerName = ownerId === undefined ? undefined : owners.get(ownerId);
      if (ownerId === undefined || ownerName === undefined)
        problems.push(`${where}: owner ${ownerId ?? '(none)'} is defined by no meta file`);
      const lineName = family.line === undefined ? undefined : meta.lines?.[family.line];
      if (family.line !== undefined && lineName === undefined)
        problems.push(`${where}: line ${family.line} is not in the lines of its meta file`);
      const kind: Kind =
        family.kind ??
        (group === 'avatar' ? 'avatar' : group === 'illustrations' ? 'illustration' : 'logo');

      const variants: Variant[] = [];
      for (const entry of family.files) {
        const { file, ...override } = typeof entry === 'string' ? { file: entry } : entry;
        const rel = path.join(dir, file);
        if (!svgs.has(rel)) {
          problems.push(`${where}: ${rel}.svg does not exist`);
          continue;
        }
        if (listed.has(rel)) problems.push(`${where}: ${rel} is listed by ${listed.get(rel)} too`);
        listed.set(rel, family.id);
        const parsed = parseName(path.basename(file), kind);
        const color = override.color ?? parsed.color;
        const form = kind === 'logo' ? (override.form ?? parsed.form) : undefined;
        const svg = await readFile(path.join(RESOURCES_DIR, `${rel}.svg`), 'utf8');
        variants.push({
          path: rel.split(path.sep).join('/'),
          ...(form ? { form } : {}),
          color,
          background: override.background ?? backgroundOf(color),
          ...svgSize(svg),
        });
      }
      variants.sort(
        (a, b) =>
          FORMS.indexOf(a.form ?? 'logo') - FORMS.indexOf(b.form ?? 'logo') ||
          COLORS.indexOf(a.color) - COLORS.indexOf(b.color),
      );

      assets.push({
        id: family.id,
        name: family.name,
        kind,
        group,
        owner: { id: ownerId ?? '', name: ownerName ?? '' },
        ...(family.line && lineName ? { line: { id: family.line, name: lineName } } : {}),
        variants,
        formats: { svg: true, pdf: true, png: RASTER_WIDTHS, webp: RASTER_WIDTHS },
      });
    }
  }

  for (const svg of svgs)
    if (!listed.has(svg)) problems.push(`${svg}.svg: no family of an ${META_FILE} lists it`);

  if (problems.length > 0) {
    console.error(
      chalk.red(
        `${problems.length} problem(s) between the artworks and their ${META_FILE} files:\n` +
          problems.map((problem) => `  ${problem}`).join('\n'),
      ),
    );
    process.exit(1);
  }

  assets.sort((a, b) => GROUPS.indexOf(a.group) - GROUPS.indexOf(b.group));
  await mkdir(DIST_DIR, { recursive: true });
  await writeFile(
    path.join(DIST_DIR, OUT_FILE),
    `${JSON.stringify({ assets }, null, 2)}\n`,
    'utf8',
  );
  logFileSavedTo(OUT_FILE, DIST_DIR);
  console.info(chalk.green(`${assets.length} families, ${listed.size} artworks`));
};

main();
