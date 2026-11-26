import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  BUDGET,
  PARADIGM,
  checkContext,
  isContext,
  tokens,
  type Repository,
} from './agent-context.ts';
import type { ProjectGraph } from './diagrams.ts';

const graph: ProjectGraph = {
  nodes: {
    magma: { data: { root: '.', targets: { 'check.agent-context': {} } } },
    stencil: {
      data: { root: 'projects/stencil', targets: { build: {}, test: {}, 'lint:fix': {} } },
    },
    mcp: { data: { root: 'projects/mcp', targets: { test: {} } } },
  },
  dependencies: {},
};

const AGENTS = [
  '# AGENTS.md',
  '',
  'Read [the workflow](docs/WORKFLOW.md) and `docs/{WORKFLOW,COMMITS}.md`, then `projects/<name>/README.md`;',
  'the generated `projects/stencil/dist/collection/AGENTS.md`, the export `magma/eslint`.',
  'The skill `/review-work`; the twelve tools of `nx run mcp:test`.',
  '',
  '## Sub-projects and build order',
  '',
  '```',
  'mcp      ->  no internal dependencies',
  'stencil  ->  mcp',
  '```',
].join('\n');

const BASE: Record<string, string> = {
  'CLAUDE.md': '<!-- loads the index -->\n@AGENTS.md\n',
  'AGENTS.md': AGENTS,
  'docs/WORKFLOW.md':
    'See [the types](COMMITS.md#types), [a component](../projects/stencil/src/components/) and [a page](https://example.com).',
  'docs/COMMITS.md': [
    '- **`type`** - one of the 2 allowed values.',
    '## Types',
    '| Type | Use for |',
    '| ---- | ------- |',
    '| `feat` | a feature |',
    '| `fix` | a fix |',
    '## Scopes',
    '### 1. Project scopes (static list)',
    '```',
    'magma, stencil',
    '```',
  ].join('\n'),
  '.github/instructions/commit-messages.instructions.md': [
    '- Allowed types: `feat`,',
    '  `fix`',
    '- Use **`fix`** (not `fixes`)',
    '- Project scopes: `magma`, `stencil`',
  ].join('\n'),
  'projects/mcp/README.md':
    'The other eleven tools are read-only.\n```\n[an example](nowhere.md)\n```',
  'projects/stencil/README.md':
    'Run `nx run stencil:lint:fix`, see [the guide](../../docs/agents/My%20Guide.md).',
  'projects/stencil/CHANGELOG.md': '[a release](nowhere.md)',
  'projects/stencil/src/components/mds-a/mds-a.tsx': '',
  'projects/stencil/src/components/mds-b/mds-b.tsx': '',
  'docs/agents/My Guide.md': 'The [catalogue](components.md), built by `nx run stencil:build`.',
  '.claude/skills/review-work/SKILL.md':
    '---\nname: review-work\ndescription: Review the work.\n---\n\n# Review\n',
};

const repository = (changes: Record<string, string | undefined> = {}, tools = 12): Repository => {
  const files = { ...BASE, ...changes };
  for (const [file, text] of Object.entries(files)) if (text === undefined) delete files[file];
  return {
    files: Object.keys(files),
    read: (file) => files[file],
    graph,
    tools,
    commitlint: { types: ['feat', 'fix'], scopes: ['magma', 'stencil', 'mds-a', 'mds-b'] },
  };
};

const errorsOf = (changes: Record<string, string | undefined> = {}, tools?: number) =>
  checkContext(repository(changes, tools)).errors;

describe('isContext', () => {
  it('takes the documents written by hand for the agents of the repository', () => {
    for (const file of [
      'AGENTS.md',
      'README.md',
      'docs/WORKFLOW.md',
      'projects/styles/SEMANTIC_COLOR_SPEC.md',
      '.claude/skills/pattern-new/SKILL.md',
      '.github/PULL_REQUEST_TEMPLATE.md',
      '.github/instructions/commit-messages.instructions.md',
    ])
      assert.equal(isContext(file), true, file);
    for (const file of [
      'projects/stencil/CHANGELOG.md',
      'docs/agents/conventions.md',
      'projects/stencil/src/components/mds-a/readme.md',
      '.github/ISSUE_TEMPLATE/config.yml',
    ])
      assert.equal(isContext(file), false, file);
  });
});

describe('checkContext', () => {
  it('passes a context that matches its repository, and measures what every session loads', () => {
    const report = checkContext(repository());
    assert.deepEqual(report.errors, []);
    assert.equal(report.links, 4);
    assert.equal(report.commands, 3);
    assert.deepEqual(report.loaded.files, ['CLAUDE.md', 'AGENTS.md', '1 skill descriptions']);
    assert.equal(
      report.loaded.tokens,
      tokens(BASE['CLAUDE.md']) + tokens(AGENTS) + tokens('review-work: Review the work.'),
    );
    assert.equal(report.largest[0][0], 'AGENTS.md');
  });

  it('fails a link that reaches no tracked file, with its line', () => {
    assert.deepEqual(errorsOf({ 'docs/WORKFLOW.md': 'One.\n\nSee [the old guide](OLD.md#top).' }), [
      'docs/WORKFLOW.md:3: the link OLD.md#top reaches no tracked file',
    ]);
  });

  it('fails a path of the index that is not in the repository, each name of a brace', () => {
    assert.deepEqual(
      errorsOf({ 'AGENTS.md': AGENTS.replace('{WORKFLOW,COMMITS}', '{WORKFLOW,TOKENS}') }),
      ['AGENTS.md:3: docs/TOKENS.md is not in the repository'],
    );
    assert.deepEqual(
      errorsOf({ 'AGENTS.md': AGENTS.replace('<name>/README.md', '<name>/SPEC.md') }),
      ['AGENTS.md:3: projects/<name>/SPEC.md is not in the repository'],
    );
  });

  it('fails a command that names no target of the project graph, in the guides too', () => {
    assert.deepEqual(
      errorsOf({
        'docs/agents/My Guide.md': 'Run `nx run stencil:check.old`.',
        'projects/stencil/README.md': 'Run nx run styles:build.',
      }),
      [
        'projects/stencil/README.md:1: nx run styles:build is no target of the project graph',
        'docs/agents/My Guide.md:1: nx run stencil:check.old is no target of the project graph',
      ],
    );
  });

  it('fails a project missing from the build order, a line that is no project, a skill not named', () => {
    assert.deepEqual(errorsOf({ 'AGENTS.md': AGENTS.replace('mcp      ->', 'lint     ->') }), [
      'AGENTS.md: "Sub-projects and build order" misses mcp',
      'AGENTS.md: "Sub-projects and build order" lists lint, not a project',
    ]);
    assert.deepEqual(
      errorsOf({
        '.claude/skills/context-review/SKILL.md':
          '---\nname: context-review\ndescription: x\n---\n',
      }),
      ['AGENTS.md: the skill /context-review is not named'],
    );
  });

  it('fails a count of the components or of the tools that is not theirs', () => {
    assert.deepEqual(
      errorsOf({ 'README.md': 'Magma: 115 web components, two components per row.' }),
      ['README.md:1: "115 web components", there are 2'],
    );
    assert.deepEqual(errorsOf({}, 13), [
      'AGENTS.md:5: "twelve tools", the MCP server has 13 tools',
      'projects/mcp/README.md:1: "other eleven tools", the MCP server has 13 tools',
    ]);
  });

  it('fails a copy of the commit types or scopes that is not that of commitlint.config.js', () => {
    assert.deepEqual(
      errorsOf({
        '.github/instructions/commit-messages.instructions.md':
          '- Allowed types: `feat`, `fix`, `doc`\n- Project scopes: `magma`',
      }),
      [
        '.github/instructions/commit-messages.instructions.md: the types name doc, which commitlint.config.js does not allow',
        '.github/instructions/commit-messages.instructions.md: the project scopes miss stencil (commitlint.config.js allows them)',
      ],
    );
    assert.deepEqual(
      errorsOf({
        'docs/COMMITS.md': BASE['docs/COMMITS.md'].replace('the 2 allowed', 'the 14 allowed'),
      }),
      ['docs/COMMITS.md:1: "14 allowed values", commitlint.config.js allows 2'],
    );
    assert.deepEqual(
      errorsOf({
        '.github/instructions/commit-messages.instructions.md': '- Allowed types: `feat`, `fix`',
      }),
      ['.github/instructions/commit-messages.instructions.md: no bullet "- Project scopes:"'],
    );
  });

  it('leaves out of the budget a skill only a person launches, still naming it in AGENTS.md', () => {
    const launched = '.claude/skills/send-replies/SKILL.md';
    const skill = (flag: string) =>
      `---\nname: send-replies\ndescription: ${'Send. '.repeat(200)}\n${flag}---\n\n# Send\n`;
    const named = { 'AGENTS.md': `${AGENTS}\nThe skill \`/send-replies\`.` };
    const report = checkContext(
      repository({ ...named, [launched]: skill('disable-model-invocation: true\n') }),
    );
    assert.deepEqual(report.errors, []);
    assert.deepEqual(report.loaded.files, ['CLAUDE.md', 'AGENTS.md', '1 skill descriptions']);
    assert.equal(
      report.loaded.tokens,
      tokens(BASE['CLAUDE.md']) +
        tokens(named['AGENTS.md']) +
        tokens('review-work: Review the work.'),
    );
    const counted = checkContext(repository({ ...named, [launched]: skill('') }));
    assert.deepEqual(counted.loaded.files, ['CLAUDE.md', 'AGENTS.md', '2 skill descriptions']);
    assert.equal(
      errorsOf({ [launched]: skill('disable-model-invocation: true\n') }).join(),
      'AGENTS.md: the skill /send-replies is not named',
    );
  });

  it('names a skill of a plugin kept in .claude/skills with its prefix, its name and description valid', () => {
    const skill = '.claude/skills/maint/skills/triage/SKILL.md';
    const manifest = '.claude/skills/maint/.claude-plugin/plugin.json';
    const plugin = {
      [manifest]: '{"name": "maint-dev"}',
      [skill]: '---\nname: triage\ndescription: Triage the issues.\n---\n',
    };
    const named = { 'AGENTS.md': `${AGENTS}\nThe skill \`/maint-dev:triage\`.` };
    assert.deepEqual(errorsOf({ ...plugin, ...named }), []);
    assert.deepEqual(errorsOf(plugin), ['AGENTS.md: the skill /maint-dev:triage is not named']);
    assert.deepEqual(errorsOf({ ...plugin, ...named, [manifest]: undefined }), [
      `${skill}: no .claude/skills/maint/.claude-plugin/plugin.json, so Claude Code does not load it`,
    ]);
    assert.deepEqual(errorsOf({ ...plugin, ...named, [manifest]: '{}' }), [
      `${manifest}: no "name", the prefix of the plugin's skills`,
    ]);
    assert.deepEqual(
      errorsOf({ ...plugin, ...named, [skill]: '---\nname: triage-all\ndescription:\n---\n' }),
      [
        `${skill}: name "triage-all" is not the name of its folder, triage`,
        `${skill}: the description is empty or longer than 1,536 characters (0)`,
      ],
    );
  });

  it('holds what the files of paradigm-check copy of each other', () => {
    const files = {
      [`${PARADIGM}/page.html`]: [
        'var ISSUE_VOTES = ["Accoglibile", "Altra forma"];',
        'var PR_VOTES = ["Pronta"];',
        'var DEFER = "Da decidere";',
        'db.collection("items").onSnapshot(); db.doc("meta/run").onSnapshot();',
      ].join('\n'),
      [`${PARADIGM}/page.md`]: [
        '## Publish',
        '{"db": {"rules": [{"path": "items"}, {"path": "meta"}]}}',
        '## The store',
        '| Collection | Written by |',
        '|---|---|',
        '| `items/<n>` | agent |',
        '| `meta/run` | agent |',
        '### `items/<n>`',
        '| Field | Value |',
        '|---|---|',
        '| `n` | the number |',
      ].join('\n'),
      [`${PARADIGM}/criterion.md`]: [
        '# The criterion v2',
        '## The scales',
        '### Issues',
        '| Vote | When |',
        '|---|---|',
        '| Accoglibile | a |',
        '| Altra forma | b |',
        '| Da decidere | c |',
        '### Pull requests',
        '| Vote | When |',
        '|---|---|',
        '| Pronta | a |',
        '| Da decidere | b |',
        '## Decisions recorded on issues',
        'Each with its issue.',
        '- A decision',
        '  over two lines (#12).',
        '## History',
        '### v2 (2026-11-26)',
        '### v1 (2026-11-25)',
      ].join('\n'),
      [`${PARADIGM}/cases.md`]: [
        '# Cases',
        '## Round of 2026-11-25',
        '### #12 A case (2026-11-25)',
        '- Asked: something.',
        '- In the criterion: the decisions.',
      ].join('\n'),
    };
    assert.deepEqual(errorsOf(files), []);
    const criterion = files[`${PARADIGM}/criterion.md`];
    assert.deepEqual(
      errorsOf({
        ...files,
        [`${PARADIGM}/criterion.md`]: criterion
          .replace('| Altra forma |', '| Altra via |')
          .replace('# The criterion v2', '# The criterion v3')
          .replace('  over two lines (#12).', '  over two lines.'),
        [`${PARADIGM}/page.md`]: files[`${PARADIGM}/page.md`].replace(
          '| `meta/run` | agent |\n',
          '',
        ),
        [`${PARADIGM}/cases.md`]: '### #12 A case\n- Asked: something.',
      }),
      [
        `${PARADIGM}/criterion.md: the votes of "Issues" differ from page.html (missing: Altra forma; not in page.html: Altra via)`,
        `${PARADIGM}/page.md: the collections of "The store" differ from page.html (missing: meta; not in page.html: none)`,
        `${PARADIGM}/criterion.md: the title names v3, the newest entry of History is v2 (2026-11-26)`,
        `${PARADIGM}/criterion.md: a decision names no issue: "A decision over two lines."`,
        `${PARADIGM}/cases.md: the case "### #12 A case" names no issue or no date (YYYY-MM-DD)`,
        `${PARADIGM}/cases.md: the case "### #12 A case" says not where the criterion holds it`,
      ],
    );
  });

  it('fails what every session loads past the budget', () => {
    const errors = errorsOf({ 'AGENTS.md': `${AGENTS}\n${'x'.repeat(BUDGET * 4)}` });
    assert.equal(errors.length, 1);
    assert.match(
      errors[0],
      /^every session loads ~\d+ tokens before any task \(CLAUDE\.md, AGENTS\.md, 1 skill descriptions\), over the budget of 6500/,
    );
  });
});
