import { createContext, useContext, useEffect, useState } from 'react';
import {
  Controls,
  Description,
  DocsPage,
  Markdown,
  Primary,
  Subtitle,
  Title,
} from '@storybook/addon-docs/blocks';

import { USAGE_SECTIONS, componentTagOf, renderUsageMarkdown } from './usage-markdown';

/**
 * The `usage/*.md` files of every component, each one a module loaded on demand (`?raw`):
 * Vite follows their edits, so a change to a file reaches the open Docs page without a build.
 */
const usageFiles = import.meta.glob('../src/components/*/usage/*.md', {
  query: '?raw',
  import: 'default',
});

const usageFileKey = (tag, file) => `../src/components/${tag}/usage/${file}`;

/** whether the component has the three `usage/*.md` files */
export const hasUsage = (tag) =>
  USAGE_SECTIONS.every(({ file }) => usageFileKey(tag, file) in usageFiles);

/** the content of the three files, `null` for a component without them */
export const loadUsage = async (tag) => {
  if (!tag || !hasUsage(tag)) {
    return null;
  }
  const contents = await Promise.all(
    USAGE_SECTIONS.map(({ file }) => usageFiles[usageFileKey(tag, file)]()),
  );
  return Object.fromEntries(USAGE_SECTIONS.map(({ key }, index) => [key, contents[index]]));
};

/** one section of the Docs page: the markdown of a `usage/*.md` file */
export const UsageSection = ({ tag, section, content }) => (
  <Markdown>{renderUsageMarkdown({ tag, section, content })}</Markdown>
);

/** the three sections one after the other: the page of a component without stories */
export const UsageDocs = ({ tag, sections }) => (
  <>
    {USAGE_SECTIONS.map(({ key }) => (
      <UsageSection key={key} tag={tag} section={key} content={sections[key]} />
    ))}
  </>
);

/** the component attached to the Docs page: `null` for an unattached MDX page or a use-case stories file */
const attachedTag = (context) => {
  try {
    return componentTagOf(context.resolveOf('meta', ['meta']).preparedMeta.parameters.fileName);
  } catch {
    return null;
  }
};

const UsageContext = createContext(null);

/**
 * Loads the usage files of the attached component before the docs container mounts: the table
 * of contents (tocbot) collects the headings once, shortly after the mount, so the sections
 * have to be in the DOM from the first render of the page.
 */
export const UsageProvider = ({ context, children }) => {
  const tag = attachedTag(context);
  const [loaded, setLoaded] = useState(null);

  useEffect(() => {
    if (!tag) {
      return undefined;
    }
    let cancelled = false;
    loadUsage(tag).then((sections) => {
      if (!cancelled) {
        setLoaded({ tag, sections });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [tag]);

  if (tag && loaded?.tag !== tag) {
    return null;
  }
  const usage = tag && loaded.sections ? { tag, sections: loaded.sections } : null;
  return <UsageContext.Provider value={usage}>{children}</UsageContext.Provider>;
};

/**
 * The autodocs template (`parameters.docs.page`): title, description and primary story as in
 * the default page, with the usage sections around them. A page without usage files (the
 * pages of src/storybook, the use-case stories files) keeps the default template.
 */
export const UsageDocsPage = () => {
  const usage = useContext(UsageContext);
  if (!usage) {
    return <DocsPage />;
  }
  const { tag, sections } = usage;
  return (
    <>
      <Title />
      <Subtitle />
      <Description of="meta" />
      <UsageSection tag={tag} section="description" content={sections.description} />
      <Primary />
      <Controls />
      <UsageSection tag={tag} section="pattern" content={sections.pattern} />
      <UsageSection tag={tag} section="antipattern" content={sections.antipattern} />
    </>
  );
};
