import { describe, expect, it } from 'vitest';
import {
  REPOSITORY_BRANCH,
  REPOSITORY_URL,
  USAGE_SECTIONS,
  componentTagOf,
  renderUsageMarkdown,
  repositoryUrl,
  usageSectionsOf,
} from '../../../.storybook/usage-markdown';

const github = `${REPOSITORY_URL}/blob/${REPOSITORY_BRANCH}`;

describe('componentTagOf', () => {
  it('names the component after the folder of a stories file named like it', () => {
    expect(componentTagOf('./src/components/mds-button/test/mds-button.stories.tsx')).toBe(
      'mds-button',
    );
  });

  it('accepts a stories file named after a prefix of its folder', () => {
    expect(
      componentTagOf('./src/components/mds-input-tip-item/test/mds-input-tip.stories.tsx'),
    ).toBe('mds-input-tip-item');
    expect(componentTagOf('./src/components/mds-policy-ai/test/mds-policy.stories.tsx')).toBe(
      'mds-policy-ai',
    );
  });

  it('documents no component from a use-case stories file', () => {
    expect(componentTagOf('./src/components/mds-tree/test/mds-tree-apk.stories.tsx')).toBeNull();
    expect(
      componentTagOf('./src/components/mds-img/test/mds-img-accessibility.stories.tsx'),
    ).toBeNull();
  });

  it('documents no component from the stories outside the components folder', () => {
    expect(componentTagOf('./src/storybook/color-scale.stories.tsx')).toBeNull();
    expect(componentTagOf(undefined)).toBeNull();
  });
});

describe('usageSectionsOf', () => {
  const required = ['1. Description.md', '2. Examples.md', '3. Mistakes.md'];
  const keysOf = (files: string[]) =>
    usageSectionsOf((file) => files.includes(file))?.map(({ key }) => key) ?? null;

  it('puts the need and the place right after the description, before the examples', () => {
    expect(USAGE_SECTIONS.map(({ heading }) => heading)).toEqual([
      'Description',
      'When to use',
      'Placement context',
      'Examples',
      'Mistakes',
    ]);
    expect(keysOf([...required, '4. When to use.md', '5. Placement context.md'])).toEqual([
      'description',
      'whenToUse',
      'placement',
      'examples',
      'mistakes',
    ]);
  });

  it('shows the need and the place only for a component that has their files', () => {
    expect(keysOf(required)).toEqual(['description', 'examples', 'mistakes']);
    expect(keysOf([...required, '5. Placement context.md'])).toEqual([
      'description',
      'placement',
      'examples',
      'mistakes',
    ]);
  });

  it('keeps the default page for a component without the three required files', () => {
    expect(keysOf(['1. Description.md', '4. When to use.md', '5. Placement context.md'])).toBe(
      null,
    );
  });
});

describe('repositoryUrl', () => {
  it('points a repository-relative file at GitHub, the anchor kept', () => {
    expect(
      repositoryUrl(
        'mds-button',
        '../../../../../../docs/COMPONENTS.md#system-level-anti-patterns',
      ),
    ).toBe(`${github}/docs/COMPONENTS.md#system-level-anti-patterns`);
    expect(repositoryUrl('mds-button', '../../../../SPEC.md')).toBe(
      `${github}/projects/stencil/SPEC.md`,
    );
    expect(repositoryUrl('mds-button', '../readme.md')).toBe(
      `${github}/projects/stencil/src/components/mds-button/readme.md`,
    );
  });

  it('points a sibling component at its folder', () => {
    expect(repositoryUrl('mds-table-header-cell', '../../mds-table-header')).toBe(
      `${REPOSITORY_URL}/tree/${REPOSITORY_BRANCH}/projects/stencil/src/components/mds-table-header`,
    );
  });

  it('leaves external links, anchors and paths outside the repository alone', () => {
    expect(repositoryUrl('mds-button', 'https://example.com/a.md')).toBeNull();
    expect(repositoryUrl('mds-button', 'mailto:someone@example.com')).toBeNull();
    expect(repositoryUrl('mds-button', '#semantic-behavior')).toBeNull();
    expect(repositoryUrl('mds-button', '../../../../../../../outside.md')).toBeNull();
  });
});

describe('renderUsageMarkdown', () => {
  const content = [
    'The `<mds-button>` component. See [`docs/COMPONENTS.md`](../../../../../../docs/COMPONENTS.md).',
    '',
    '#### Semantic Behavior',
    '',
    '- rule one, see [the spec](../../../../SPEC.md#tone-and-variant-system "the spec")',
    '',
    '##### Nested',
    '',
    '```html',
    '<!-- [a link in code](../../mds-icon) stays -->',
    '#### not a heading',
    '```',
    '',
    '#### Second',
    '',
  ].join('\n');

  const rendered = renderUsageMarkdown({ tag: 'mds-button', section: 'description', content });

  it('opens with the section heading', () => {
    expect(rendered.startsWith('## Description\n\n')).toBe(true);
  });

  it('shifts the headings right below the section heading, the nesting kept', () => {
    expect(rendered).toContain('\n### Semantic Behavior\n');
    expect(rendered).toContain('\n#### Nested\n');
    expect(rendered).toContain('\n### Second\n');
  });

  it('points the repository-relative links at GitHub, titles and anchors kept', () => {
    expect(rendered).toContain(`[\`docs/COMPONENTS.md\`](${github}/docs/COMPONENTS.md)`);
    expect(rendered).toContain(
      `[the spec](${github}/projects/stencil/SPEC.md#tone-and-variant-system "the spec")`,
    );
  });

  it('leaves the code blocks as they are', () => {
    expect(rendered).toContain('<!-- [a link in code](../../mds-icon) stays -->');
    expect(rendered).toContain('\n#### not a heading\n');
  });

  it('names the section after the heading of its usage file', () => {
    expect(renderUsageMarkdown({ tag: 'mds-button', section: 'examples', content: 'x' })).toBe(
      '## Examples\n\nx\n',
    );
    expect(renderUsageMarkdown({ tag: 'mds-button', section: 'mistakes', content: 'x' })).toBe(
      '## Mistakes\n\nx\n',
    );
    expect(renderUsageMarkdown({ tag: 'mds-tab', section: 'whenToUse', content: 'x' })).toBe(
      '## When to use\n\nx\n',
    );
    expect(renderUsageMarkdown({ tag: 'mds-tab', section: 'placement', content: 'x' })).toBe(
      '## Placement context\n\nx\n',
    );
  });

  it('nests the headings of the need and the place below their section', () => {
    const rendered = renderUsageMarkdown({
      tag: 'mds-tab',
      section: 'whenToUse',
      content: '#### Use it for\n\n- A need.\n\n#### Not for\n\n- Another: `mds-filter`.\n',
    });
    expect(rendered).toBe(
      '## When to use\n\n### Use it for\n\n- A need.\n\n### Not for\n\n- Another: `mds-filter`.\n',
    );
  });

  it('shifts nothing when the file has no heading', () => {
    expect(
      renderUsageMarkdown({ tag: 'mds-button', section: 'description', content: 'plain\n' }),
    ).toBe('## Description\n\nplain\n');
  });
});
