/**
 * Where the Storybook pages of the components sit in the sidebar (#1106): under
 * `UI / <Category>`, the category of their `@category` tag, each part of a compound under
 * the page of its compound. Storybook reads a title only as a string literal, so each
 * stories file and MDX page writes its own; this keeps them in step with the `@category`
 * and `@parent` tags of the components (docs/COMPONENTS.md, "Categories").
 *
 * Kept free of anything but reads, so scripts/story-titles-lib.spec.ts can run it on
 * fixtures and on the real tree.
 */
import fs from 'node:fs';
import path from 'node:path';
import { toId } from 'storybook/internal/csf';
import { componentTagOf } from '../.storybook/usage-markdown';
import {
  COMPONENT_CATEGORIES,
  readTaxonomy,
  rootOf,
  type ComponentTaxonomy,
} from './agent-docs-lib';
import { PROJECT_DIR } from './meta';

/** The group of the sidebar that holds the pages of every component. */
export const STORIES_ROOT = 'UI';

/** A Storybook page of a component: a stories file or an MDX page of its `test/` folder. */
export interface StoryPage {
  tag: string;
  /** the name of the file in `<tag>/test/` */
  file: string;
  /** the `title` of the stories file, the `<Meta title>` of the MDX page */
  title?: string;
  /** the `id` of the stories file, the `<Meta id>` of the MDX page, when it sets one */
  id?: string;
}

/** The title of a stories file (the `title` of its meta) or of an MDX page (`<Meta title>`). */
export const readStoryTitle = (file: string, source: string): string | undefined =>
  file.endsWith('.mdx')
    ? /<Meta\b[^>]*\btitle="([^"]*)"/.exec(source)?.[1]
    : /^ {2}title: (['"])(.*?)\1/m.exec(source)?.[2];

/**
 * The stories file named after its component, the one that carries its usage docs:
 * `mds-tree.stories.tsx`, or a shorter name for a longer tag (`mds-policy.stories.tsx` in
 * `mds-policy-ai`), as `.storybook/usage-markdown.ts` reads it.
 */
const isOwnPage = (page: StoryPage): boolean =>
  componentTagOf(`./src/components/${page.tag}/test/${page.file}`) === page.tag;

/** The id of a stories file (the `id` of its meta) or of an MDX page (`<Meta id>`), if set. */
export const readStoryId = (file: string, source: string): string | undefined =>
  file.endsWith('.mdx')
    ? /<Meta\b[^>]*\bid="([^"]*)"/.exec(source)?.[1]
    : /^ {2}id: (['"])(.*?)\1/m.exec(source)?.[2];

/** The taxonomy and the Storybook pages of every component under `componentsDir`. */
export const readComponentStories = (
  componentsDir: string,
): { components: ComponentTaxonomy[]; pages: StoryPage[] } => {
  const tags = fs
    .readdirSync(componentsDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory() && dirent.name.startsWith('mds-'))
    .map(({ name }) => name)
    .sort();
  const components = tags.map((tag) =>
    readTaxonomy(tag, fs.readFileSync(path.join(componentsDir, tag, `${tag}.tsx`), 'utf8')),
  );
  const pages = tags.flatMap((tag) => {
    const dir = path.join(componentsDir, tag, 'test');
    if (!fs.existsSync(dir)) return [];
    return fs
      .readdirSync(dir)
      .filter((file) => /\.stories\.[jt]sx?$|\.mdx$/.test(file))
      .sort()
      .map((file) => {
        const source = fs.readFileSync(path.join(dir, file), 'utf8');
        return { tag, file, title: readStoryTitle(file, source), id: readStoryId(file, source) };
      });
  });
  return { components, pages };
};

/**
 * What is wrong with the titles of the component pages, one line each. A component with a
 * category has a stories file named after it (the one that carries its usage docs) titled
 * `UI / <Category title> / <Name>`; its other pages sit under that title, and so do the pages
 * of its parts, whose first parents lead to it (`UI / Data / Table / Cell`).
 */
export function storyTitleErrors(components: ComponentTaxonomy[], pages: StoryPage[]): string[] {
  const byTag = new Map(components.map((c) => [c.tag, c]));
  const errors: string[] = [];
  const ownTitles = new Map<string, string>();
  for (const { tag, category } of components) {
    if (category === undefined) continue;
    const own = pages.find((page) => page.tag === tag && isOwnPage(page));
    if (!own) {
      errors.push(`${tag}: no stories file named after it in ${tag}/test/`);
      continue;
    }
    const categoryTitle = COMPONENT_CATEGORIES.find((c) => c.id === category)?.title;
    const [root, group, name, ...rest] = (own.title ?? '').split(' / ');
    if (root !== STORIES_ROOT || group !== categoryTitle || !name?.trim() || rest.length > 0) {
      errors.push(
        `${tag}/test/${own.file}: title "${own.title}" is not "${STORIES_ROOT} / ${categoryTitle} / <name>" (@category ${category})`,
      );
    }
    ownTitles.set(tag, own.title ?? '');
  }
  for (const page of pages) {
    const component = byTag.get(page.tag);
    if (!component || (component.category !== undefined && isOwnPage(page))) continue;
    const compound = rootOf(page.tag, byTag);
    const under = compound && ownTitles.get(compound);
    if (under === undefined || page.title?.startsWith(`${under} / `)) continue;
    errors.push(
      `${page.tag}/test/${page.file}: title "${page.title}" is not under "${under}", the page of ${compound}`,
    );
  }
  return errors;
}

/**
 * The address of the GitHub Pages site of a repository, from its URL as package.json writes it
 * (`git+https://github.com/<owner>/<repo>.git`, the form npm normalises it to): GitHub serves
 * the project site of `<owner>/<repo>` at `https://<owner>.github.io/<repo>/` (GitHub Docs,
 * "About GitHub Pages", "Types of GitHub Pages sites"), with no custom domain set. A URL that
 * is not of a GitHub repository has no such site: it throws instead of guessing one.
 */
export function pagesUrlOf(repository: string): string {
  const match = /^(?:git\+)?https:\/\/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?\/?$/.exec(
    repository,
  );
  if (!match) throw new Error(`Not the URL of a GitHub repository: ${repository}`);
  return `https://${match[1]!.toLowerCase()}.github.io/${match[2]}/`;
}

/**
 * The Pages site of the repository of magma, read from `repository.url` of its package.json:
 * npm checks that field against the repository a release with provenance is built in, so it
 * names the repository deploy-site.yml runs in. Read here, in an input of the stencil build,
 * so the addresses below are rebuilt when it changes.
 */
export const PAGES_URL = pagesUrlOf(
  JSON.parse(fs.readFileSync(path.join(PROJECT_DIR, 'package.json'), 'utf8')).repository.url,
);

/**
 * The published Storybook: deploy-site.yml assembles the Storybook of `main` into the
 * `storybook/` folder of the Pages site (since the move away from GitLab CI). A docs page
 * opens at `?path=/docs/<id>`. The folder is the workflow's choice, not an input of this
 * build: story-titles-lib.spec.ts fails when the workflow moves it.
 */
export const STORYBOOK_URL = `${PAGES_URL}storybook/`;

/**
 * The published studio (projects/studio, #1288, #1294): deploy-site.yml assembles the studio
 * of `main` into the `studio/` folder of the Pages site. Its build does not decide where it
 * lives, since it loads everything by relative paths (`base: './'` of its vite.config.ts), and
 * its pages are addressed by the hash (`#/theme`, `#/colors/palette`, src/routes.ts), so this
 * root is all a link needs. story-titles-lib.spec.ts holds the folder to the workflow and the
 * address to the `og:url` of projects/studio/index.html.
 */
export const STUDIO_URL = `${PAGES_URL}studio/`;

/**
 * Where the site of `main` is published, as the top of documentation.json (and of the
 * documentation.json of each component) says it, so its readers link it without keeping an
 * address of their own (docs/CONTRACTS.md, "documentation.json").
 */
export const PUBLISHED_SITE = { storybook: STORYBOOK_URL, studio: STUDIO_URL };

/**
 * The id of the Storybook docs page of each component (#1148): the page of its own stories
 * file (isOwnPage), else of the MDX page named after it. The ids do not follow the tags
 * (`mds-img` is `ui-image`) nor always the titles (#1106 kept the old URLs), so they are read
 * where Storybook reads them: the `id` of the meta, else the title, made an id by Storybook's
 * own toId with the name of the docs entries ("Docs", the default of `docs.defaultName`).
 */
export function storybookDocsIds(pages: StoryPage[]): Map<string, string> {
  const ids = new Map<string, string>();
  for (const tag of new Set(pages.map((page) => page.tag))) {
    const own = pages.filter((page) => page.tag === tag);
    const page = own.find(isOwnPage) ?? own.find(({ file }) => file === `${tag}.mdx`);
    const kind = page?.id ?? page?.title;
    if (kind) ids.set(tag, toId(kind, 'Docs'));
  }
  return ids;
}
