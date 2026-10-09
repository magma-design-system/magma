/**
 * The markdown of one section of a component's Docs page, built from one of its `usage/*.md`
 * files. Pure string functions: the Docs page template (usage-docs.jsx) renders the result with
 * the `Markdown` block, the spec in src/storybook/test checks them.
 */

export type UsageSectionKey = 'description' | 'pattern' | 'antipattern';

export interface UsageSection {
  key: UsageSectionKey;
  /** the file in the component's `usage/` folder */
  file: string;
  /** the heading of the section in the Docs page */
  heading: string;
}

export type UsageSections = Record<UsageSectionKey, string>;

export const USAGE_SECTIONS: readonly UsageSection[] = [
  { key: 'description', file: '1. Description.md', heading: 'Description' },
  { key: 'pattern', file: '2. Pattern.md', heading: 'Pattern' },
  { key: 'antipattern', file: '3. Antipattern.md', heading: 'Antipattern' },
];

export const COMPONENTS_PATH = 'projects/stencil/src/components';
export const REPOSITORY_URL = 'https://github.com/magma-design-system/magma';
/** the published Storybook is built from `dev` (.github/workflows/deploy-storybook.yml) */
export const REPOSITORY_BRANCH = 'dev';

const STORIES_FILE = /\/src\/components\/([^/]+)\/test\/([^/]+)\.stories\.[jt]sx?$/;

/**
 * The component a stories file documents, from the import path Storybook keeps in
 * `parameters.fileName` (`./src/components/mds-button/test/mds-button.stories.tsx`): the file
 * named after its folder, or after a prefix of it (`mds-input-tip-item/test/mds-input-tip.stories.tsx`).
 * A use-case file with a longer name (`mds-tree/test/mds-tree-apk.stories.tsx`) documents none.
 */
export const componentTagOf = (fileName: string | undefined): string | null => {
  const match = STORIES_FILE.exec(fileName ?? '');
  if (!match) {
    return null;
  }
  const [, folder, stem] = match;
  return folder === stem || folder.startsWith(`${stem}-`) ? folder : null;
};

/** `base/relative` normalised, `null` when the `..` segments climb above the repository root */
const resolveRepositoryPath = (base: string, relative: string): string | null => {
  const segments: string[] = [];
  for (const segment of `${base}/${relative}`.split('/')) {
    if (segment === '' || segment === '.') {
      continue;
    }
    if (segment === '..') {
      if (segments.length === 0) {
        return null;
      }
      segments.pop();
      continue;
    }
    segments.push(segment);
  }
  return segments.join('/');
};

/** a scheme (`https:`, `mailto:`), a page anchor or a protocol-relative URL */
const EXTERNAL_TARGET = /^(?:[a-z][a-z0-9+.-]*:|#|\/\/)/i;

/**
 * The GitHub URL of a link written relative to the component's `usage/` folder
 * (`../../../../../../docs/COMPONENTS.md#anchor`, `../../mds-table-header`, `../readme.md`):
 * the file on the branch the Storybook is built from, or the folder for a link without an
 * extension. `null` for an external link, an anchor or a path outside the repository.
 */
export const repositoryUrl = (tag: string, target: string): string | null => {
  if (EXTERNAL_TARGET.test(target)) {
    return null;
  }
  const hashIndex = target.indexOf('#');
  const path = hashIndex === -1 ? target : target.slice(0, hashIndex);
  const hash = hashIndex === -1 ? '' : target.slice(hashIndex);
  const resolved = resolveRepositoryPath(`${COMPONENTS_PATH}/${tag}/usage`, path);
  if (resolved === null || resolved === '') {
    return null;
  }
  const kind = resolved.split('/').pop()?.includes('.') ? 'blob' : 'tree';
  return `${REPOSITORY_URL}/${kind}/${REPOSITORY_BRANCH}/${resolved}${hash}`;
};

const FENCE = /^ {0,3}(`{3,}|~{3,})/;
const HEADING = /^(#{1,6})(?=\s)/;
/** `](target)` and `](target "title")`, the markdown link and image destinations */
const LINK_TARGET = /(\]\()([^)\s]+)((?:\s+"[^"]*")?\))/g;

/** which lines are prose, the fenced code blocks excluded */
const proseLines = (lines: string[]): boolean[] => {
  let fence: string | null = null;
  return lines.map((line) => {
    const match = FENCE.exec(line);
    if (fence === null) {
      if (match) {
        fence = match[1];
        return false;
      }
      return true;
    }
    if (match && match[1][0] === fence[0] && match[1].length >= fence.length) {
      fence = null;
    }
    return false;
  });
};

export interface RenderUsageMarkdownOptions {
  /** the component, `mds-button` */
  tag: string;
  section: UsageSectionKey;
  /** the content of the `usage/*.md` file */
  content: string;
  /** the heading level of the section, its own headings start one level below */
  level?: number;
}

/**
 * The section's markdown: a heading named after the section, the file's headings shifted so
 * that the highest one sits right below it (the files start at `####`, which the readme nests
 * under its own `### 1. Description`), the repository-relative links pointed at GitHub. Code
 * blocks are left as they are.
 */
export const renderUsageMarkdown = ({
  tag,
  section,
  content,
  level = 2,
}: RenderUsageMarkdownOptions): string => {
  const { heading } = USAGE_SECTIONS.find((item) => item.key === section) ?? { heading: section };
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  const prose = proseLines(lines);

  const headingLevels = lines
    .filter((_line, index) => prose[index])
    .map((line) => HEADING.exec(line)?.[1].length)
    .filter((length): length is number => length !== undefined);
  const shift = headingLevels.length > 0 ? level + 1 - Math.min(...headingLevels) : 0;

  const body = lines.map((line, index) => {
    if (!prose[index]) {
      return line;
    }
    return line
      .replace(HEADING, (hashes) => '#'.repeat(Math.min(6, Math.max(1, hashes.length + shift))))
      .replace(LINK_TARGET, (_match, open, target, close) => {
        return `${open}${repositoryUrl(tag, target) ?? target}${close}`;
      });
  });

  return [`${'#'.repeat(level)} ${heading}`, '', ...body].join('\n').trimEnd() + '\n';
};
