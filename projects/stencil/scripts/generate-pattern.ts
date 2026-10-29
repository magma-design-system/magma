/**
 * Writes the patterns Magma ships (docs/agents/patterns/<id>.md; #1174), without Claude too:
 *
 * - a new pattern from the template (template/pattern.md), as a draft whose fields are the
 *   questions that define one; a candidate of the same id becomes the draft, with its title,
 *   group and need;
 * - with --sync, the parts of every pattern written from its frontmatter: the title and the
 *   principle at the top, the sections Cases, Always true, Open choices and Situations.
 *
 * Then nx run stencil:check.patterns says what is still missing. The format: docs/PATTERNS.md.
 *
 * Run from the stencil package dir:
 *   npm run generate.pattern -- <id> --group <group> [--title "..."] [--need "..."]
 *   npm run generate.pattern -- --sync
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { PATTERN_GROUPS, parsePatternFile, syncBody } from '../../lint/src/core/patterns';
import { PATTERNS_DIR, REPO, TEMPLATE, fromTemplate, readPatterns, titleOf } from './patterns-lib';

const option = (name: string): string | undefined => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : undefined;
};
const fail = (message: string): never => {
  console.error(message);
  process.exit(1);
};

if (process.argv.includes('--sync')) {
  const files = readPatterns();
  const patterns = files.map((one) => one.data);
  let changed = 0;
  for (const { file, data, body } of files) {
    const text = readFileSync(file, 'utf8');
    const synced = syncBody(data, body, patterns);
    if (synced === body) continue;
    writeFileSync(file, text.slice(0, text.length - body.length) + synced);
    console.log(`synced ${relative(REPO, file)}`);
    changed += 1;
  }
  console.log(`${changed} of ${files.length} patterns synced from their frontmatter.`);
  process.exit(0);
}

const id = process.argv
  .slice(2)
  .find((arg, index, all) => !arg.startsWith('--') && !all[index - 1]?.startsWith('--'));
if (!id || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id))
  fail('Give the id of the pattern, kebab-case: npm run generate.pattern -- <id> --group <group>');
const file = join(PATTERNS_DIR, `${id}.md`);
const existing = existsSync(file)
  ? parsePatternFile(readFileSync(file, 'utf8'), file).data
  : undefined;
if (existing && existing.status !== 'candidate')
  fail(
    `${relative(REPO, file)} exists, ${existing.status}: change it instead (/pattern-change ${id}).`,
  );
const group = option('group') ?? existing?.group;
if (!group || !(group in PATTERN_GROUPS))
  fail(`Give its group, one of ${Object.keys(PATTERN_GROUPS).join(', ')}: --group <group>`);

const text = fromTemplate(readFileSync(TEMPLATE, 'utf8'), {
  id: id!,
  title: option('title') ?? existing?.title ?? titleOf(id!),
  group: group!,
  need: option('need') ?? String(existing?.need ?? 'TODO: the need, in one sentence.').trim(),
  date: new Date().toISOString().slice(0, 10),
});
writeFileSync(file, text);
console.log(
  `${existing ? 'The candidate became a draft' : 'Written'}: ${relative(REPO, file)}. Fill in its fields, then: npx nx run stencil:generate.pattern -- --sync and npx nx run stencil:check.patterns.`,
);
