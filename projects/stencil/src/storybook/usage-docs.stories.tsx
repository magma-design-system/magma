import { h } from '@stencil/core';
import { ThemeProvider, ensure } from 'storybook/theming';
import { expect, waitFor } from 'storybook/test';

import { themes } from '../../.storybook/theme.mjs';
import { UsageDocs, loadUsage } from '../../.storybook/usage-docs.jsx';
import { REPOSITORY_BRANCH, REPOSITORY_URL } from '../../.storybook/usage-markdown';

/**
 * The usage sections of the components' Docs pages (.storybook/usage-docs.jsx), rendered as
 * they are in the page: the files loaded through the Vite glob, the markdown through the
 * `Markdown` block. Hidden from the sidebar, run by `npm run test-storybook`.
 */
/** the usage sections of `tag`, as a component without stories renders them */
const usageOf = (tag: string) => ({
  loaders: [async () => ({ sections: await loadUsage(tag) })],
  // the Source blocks read the theme: Storybook provides one around the docs pages only.
  // Stencil's JSX typing (tsconfig `jsxFactory: h`) does not map the nested JSX to the
  // `children` prop that ThemeProviderProps requires, so the content goes in as a prop
  render: (_args, { loaded }) => (
    <ThemeProvider
      theme={ensure(themes.light)}
      children={<UsageDocs tag={tag} sections={loaded.sections} />}
    />
  ),
});

export default {
  title: 'Documentation / Usage docs',
  tags: ['!dev', '!autodocs'],
  ...usageOf('mds-button'),
};

export const Button = {
  play: async ({ canvas, canvasElement }) => {
    await waitFor(() => {
      const sections = canvas
        .getAllByRole('heading', { level: 2 })
        .map((heading) => heading.textContent);
      expect(sections).toEqual(['Description', 'Examples', 'Mistakes']);
    });

    // the `####` headings of the files sit right below their section
    expect(canvas.getAllByRole('heading', { level: 3 }).length).toBeGreaterThan(0);
    expect(canvas.queryAllByRole('heading', { level: 4 })).toHaveLength(0);

    // the repository-relative links point at GitHub
    const links = canvas.getAllByRole('link').map((link) => link.getAttribute('href'));
    expect(links).toContain(`${REPOSITORY_URL}/blob/${REPOSITORY_BRANCH}/docs/agents/mistakes.md`);
    expect(links.filter((href) => href.startsWith('.'))).toHaveLength(0);

    // the examples are code blocks
    expect(canvasElement.querySelectorAll('pre').length).toBeGreaterThan(0);
  },
};

// the need and the place (epic #1579): right after the description, for a component that has them
export const Tab = {
  ...usageOf('mds-tab'),
  play: async ({ canvas }) => {
    await waitFor(() => {
      const sections = canvas
        .getAllByRole('heading', { level: 2 })
        .map((heading) => heading.textContent);
      expect(sections).toEqual([
        'Description',
        'When to use',
        'Placement context',
        'Examples',
        'Mistakes',
      ]);
    });
    // the headings of the two files right below their sections (the anchor of each heading adds
    // to its accessible name: read the text)
    const headings = canvas
      .getAllByRole('heading', { level: 3 })
      .map((heading) => heading.textContent);
    expect(headings).toEqual(
      expect.arrayContaining(['Use it for', 'Not for', 'Where it goes', 'Narrow screens']),
    );
  },
};
