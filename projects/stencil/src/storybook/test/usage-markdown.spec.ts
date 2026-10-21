import { describe, expect, it } from 'vitest';
import {
  REPOSITORY_BRANCH,
  REPOSITORY_URL,
  componentTagOf,
  renderUsageMarkdown,
  repositoryUrl,
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
    expect(renderUsageMarkdown({ tag: 'mds-button', section: 'pattern', content: 'x' })).toBe(
      '## Pattern\n\nx\n',
    );
    expect(renderUsageMarkdown({ tag: 'mds-button', section: 'antipattern', content: 'x' })).toBe(
      '## Antipattern\n\nx\n',
    );
  });

  it('shifts nothing when the file has no heading', () => {
    expect(
      renderUsageMarkdown({ tag: 'mds-button', section: 'description', content: 'plain\n' }),
    ).toBe('## Description\n\nplain\n');
  });
});
