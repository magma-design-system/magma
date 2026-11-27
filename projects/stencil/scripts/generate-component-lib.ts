/**
 * The pure part of generate-component.ts (#1499): the names a new component is written with, the
 * options of the command, the title of its Storybook page. Kept free of file-system side effects
 * but for reading the page of a parent, so scripts/generate-component-lib.spec.ts can test it.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export interface ComponentNames {
  /** `MdsInputField`, the class of the component and of its element type */
  className: string;
  /** `input-field`, the tag without its prefix: the `--private-<short>-*` of its sheets */
  short: string;
  /** `Input Field`, its name on its Storybook page */
  name: string;
}

/**
 * The words of a tag as a title, each capitalized (`mds-input-field` -> `Input Field`): the form
 * most stories titles of the repository had when the scaffold was written (2026-11-23, 21 of the
 * 32 titles of more than one word, `UI / Forms / Input Field`).
 */
export const titleOf = (words: string): string =>
  words
    .split('-')
    .map((word) => `${word[0].toUpperCase()}${word.slice(1)}`)
    .join(' ');

/**
 * The names a new component is written with, from its tag.
 */
export const componentNames = (tag: string): ComponentNames => {
  const short = tag.replace(/^mds-/, '');
  return {
    className: `Mds${titleOf(short).replaceAll(' ', '')}`,
    name: titleOf(short),
    short,
  };
};

/**
 * The value of an option of the command, as `--name value` or `--name=value`; undefined when it
 * is not given.
 */
export const readOption = (args: string[], name: string): string | undefined => {
  for (let i = 0; i < args.length; i++) {
    if (args[i] === `--${name}`) return args[i + 1];
    if (args[i].startsWith(`--${name}=`)) return args[i].slice(name.length + 3);
  }
  return undefined;
};

/**
 * The positional arguments of the command: what is neither an option nor its value.
 */
export const positionals = (args: string[], options: string[]): string[] =>
  args.filter(
    (arg, i) => !arg.startsWith('--') && !options.some((name) => args[i - 1] === `--${name}`),
  );

/**
 * The title of the Storybook page of a component, from its stories file named after it or its
 * MDX page (`<Meta title>`), in its `test/` folder; undefined when it has neither.
 */
export const storyTitleOf = (testDir: string, tag: string): string | undefined => {
  const stories = join(testDir, `${tag}.stories.tsx`);
  if (existsSync(stories)) return readFileSync(stories, 'utf8').match(/\btitle:\s*'([^']+)'/)?.[1];
  const mdx = join(testDir, `${tag}.mdx`);
  if (existsSync(mdx)) return readFileSync(mdx, 'utf8').match(/<Meta[^>]*\btitle="([^"]+)"/)?.[1];
  return undefined;
};

/**
 * The title of the page of a part, under the page of its parent: the words the part adds to the
 * tag of its parent (`mds-table-cell` under `UI / Data / Table` is `UI / Data / Table / Cell`),
 * all its words without the prefix when its tag does not start with the parent's.
 */
export const partTitle = (parentTitle: string, parent: string, tag: string): string => {
  const words = tag.startsWith(`${parent}-`)
    ? tag.slice(parent.length + 1)
    : tag.replace(/^mds-/, '');
  return `${parentTitle} / ${titleOf(words)}`;
};
