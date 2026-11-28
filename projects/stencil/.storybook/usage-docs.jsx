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

import {
  USAGE_SECTIONS,
  componentTagOf,
  renderUsageMarkdown,
  usageSectionsOf,
} from './usage-markdown';

/**
 * The `usage/*.md` files of every component, each one a module loaded on demand (`?raw`):
 * Vite follows their edits, so a change to a file reaches the open Docs page without a build.
 */
const usageFiles = import.meta.glob('../src/components/*/usage/*.md', {
  query: '?raw',
  import: 'default',
});

const usageFileKey = (tag, file) => `../src/components/${tag}/usage/${file}`;

/** the sections of the component's page, from the `usage/*.md` files it has; `null` without the three required */
const sectionsOf = (tag) => usageSectionsOf((file) => usageFileKey(tag, file) in usageFiles);

/** whether the component has the three required `usage/*.md` files */
export const hasUsage = (tag) => sectionsOf(tag) !== null;

/**
 * the content of its files, by section: the three required ones and the need and the place where
 * it has them; `null` for a component without the three
 */
export const loadUsage = async (tag) => {
  const sections = tag ? sectionsOf(tag) : null;
  if (!sections) {
    return null;
  }
  const contents = await Promise.all(
    sections.map(({ file }) => usageFiles[usageFileKey(tag, file)]()),
  );
  return Object.fromEntries(sections.map(({ key }, index) => [key, contents[index]]));
};

/** one section of the Docs page: the markdown of a `usage/*.md` file, nothing without its file */
export const UsageSection = ({ tag, section, content }) =>
  content === undefined ? null : (
    <Markdown>{renderUsageMarkdown({ tag, section, content })}</Markdown>
  );

/** the sections one after the other, those it has files for: the page of a component without stories */
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
 * the default page, with the usage sections around them: the description, the need and the place
 * before the primary story, the examples and the mistakes after it. A page without usage files (the
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
      <UsageSection tag={tag} section="whenToUse" content={sections.whenToUse} />
      <UsageSection tag={tag} section="placement" content={sections.placement} />
      <Primary />
      <Controls />
      <UsageSection tag={tag} section="examples" content={sections.examples} />
      <UsageSection tag={tag} section="mistakes" content={sections.mistakes} />
    </>
  );
};
