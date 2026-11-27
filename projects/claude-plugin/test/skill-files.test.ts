import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, test } from 'vitest';
import { commonRules, filesUnder, templateTargets } from '../scripts/skill-files.js';

const folders: string[] = [];

const folderWith = (files: string[]) => {
  const dir = mkdtempSync(path.join(tmpdir(), 'skill-files-'));
  folders.push(dir);
  for (const file of files) {
    mkdirSync(path.dirname(path.join(dir, file)), { recursive: true });
    writeFileSync(path.join(dir, file), '');
  }
  return dir;
};

afterEach(() => {
  for (const dir of folders.splice(0)) rmSync(dir, { recursive: true, force: true });
});

describe('filesUnder', () => {
  test('lists the files of every depth, sorted, with forward slashes, and no folder', () => {
    const dir = folderWith(['ui/references/show.md', 'ui.md', 'ui/references/compose.md']);
    expect(filesUnder(dir)).toEqual(['ui.md', 'ui/references/compose.md', 'ui/references/show.md']);
  });
});

describe('templateTargets', () => {
  test('a template is the SKILL.md of its skill, a file of its folder the same file in the skill', () => {
    const dir = folderWith(['review.md', 'ui.md', 'ui/references/compose.md']);
    expect(templateTargets(dir)).toEqual([
      { template: 'review.md', target: 'review/SKILL.md' },
      { template: 'ui.md', target: 'ui/SKILL.md' },
      { template: 'ui/references/compose.md', target: 'ui/references/compose.md' },
    ]);
  });

  test('a folder without the template of its skill stops the build', () => {
    expect(() => templateTargets(folderWith(['ui/references/compose.md']))).toThrow(
      'templates/ui/references/compose.md: no templates/ui.md for its skill',
    );
  });

  test('two templates that write the same file stop the build', () => {
    expect(() => templateTargets(folderWith(['ui.md', 'ui/SKILL.md']))).toThrow(
      'templates/ui/SKILL.md: another template writes skills/ui/SKILL.md',
    );
  });

  test('a file that is not Markdown stops the build', () => {
    expect(() => templateTargets(folderWith(['ui.md', 'ui/run.sh']))).toThrow(
      'templates/ui/run.sh: not a Markdown template',
    );
  });
});

describe('commonRules', () => {
  const lint = new Set(['no-false-boolean', 'no-raw-color', 'no-raw-palette-classes']);
  const file = 'docs/agents/mistakes.md';

  test('takes the rule in bold of each item, on one line, without its links', () => {
    const guide = [
      '# Mistakes',
      '',
      '> Scope: every component.',
      '',
      '- **Use the [`mds-*` component](conventions.md), never the raw element it replaces**: a',
      '  `<button>` where `mds-button` exists.',
      '- **Listen to the documented `mds*` events**, not to the native ones.',
      '- **Keep the focus styles of Magma.**',
    ].join('\n');
    expect(commonRules(guide, lint, file)).toBe(
      [
        '- Use the `mds-*` component, never the raw element it replaces',
        '- Listen to the documented `mds*` events',
        '- Keep the focus styles of Magma',
      ].join('\n'),
    );
  });

  test('names the rules of the lint the item names, once each, as the ones that catch it', () => {
    const guide = [
      '- **Paint with the roles**: `magma/no-raw-palette-classes` catches a palette class,',
      '  `magma/no-raw-color` a literal colour; `magma/no-raw-color` also reads CSS.',
    ].join('\n');
    expect(commonRules(guide, lint, file)).toBe(
      '- Paint with the roles (lint: `magma/no-raw-palette-classes`, `magma/no-raw-color`)',
    );
  });

  test('an item without its rule in bold stops the build', () => {
    expect(() => commonRules('- Setting a boolean to "false".', lint, file)).toThrow(
      'docs/agents/mistakes.md: the item "Setting a boolean to "false"...." does not open with its rule in bold',
    );
  });

  test('an item naming a rule the lint does not have stops the build', () => {
    expect(() =>
      commonRules('- **Name every control**: `magma/accessible-names`.', lint, file),
    ).toThrow(
      'docs/agents/mistakes.md: the item "Name every control" names magma/accessible-names, not a rule of the lint',
    );
  });

  test('a guide with no item stops the build', () => {
    expect(() => commonRules('# Mistakes\n\nNone yet.', lint, file)).toThrow(
      'docs/agents/mistakes.md: no item',
    );
  });
});
