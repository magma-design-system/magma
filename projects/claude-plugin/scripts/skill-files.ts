/*
  The parts of scripts/skills.ts that read only files, without the MCP server, so the tests load
  them alone (#1581): which template writes which file of a skill, and the rules every path of a
  skill follows, taken from the guide that decides them.
*/
import { readdirSync, statSync } from 'node:fs';
import path from 'node:path';

/** Every file under a folder, relative to it, with forward slashes, sorted. */
export const filesUnder = (dir: string): string[] =>
  readdirSync(dir, { recursive: true, encoding: 'utf8' })
    .filter((file) => statSync(path.join(dir, file)).isFile())
    .map((file) => file.split(path.sep).join('/'))
    .sort();

/**
  What each template writes, as paths relative to the folder of the templates and to the folder
  of the skills: `<name>.md` is the SKILL.md of the skill `<name>`, and a file of the folder
  `<name>/` is the file at the same place in that skill, such as `ui/references/compose.md`.
*/
export const templateTargets = (templates: string): Array<{ template: string; target: string }> => {
  const files = filesUnder(templates);
  const skills = new Set(
    files.filter((file) => !file.includes('/')).map((file) => file.slice(0, -3)),
  );
  const targets = files.map((template) => {
    if (!template.endsWith('.md'))
      throw new Error(`templates/${template}: not a Markdown template`);
    const [name, ...rest] = template.split('/');
    if (!rest.length) return { template, target: `${name!.slice(0, -3)}/SKILL.md` };
    if (!skills.has(name!))
      throw new Error(`templates/${template}: no templates/${name}.md for its skill`);
    return { template, target: template };
  });
  const seen = new Set<string>();
  for (const { template, target } of targets) {
    if (seen.has(target))
      throw new Error(`templates/${template}: another template writes skills/${target}`);
    seen.add(target);
  }
  return targets;
};

const unlink = (text: string) => text.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');

/**
  The rules every path follows, as a Markdown list: the rule in bold that opens each item of a
  guide (docs/agents/mistakes.md), one line each, followed by the rules of the lint the item
  names (`magma/<rule>`), which catch it, in full or in part. An item without its rule in bold,
  or naming a rule the lint does not have, stops the build: the list is only as good as the
  guide it comes from.
*/
export const commonRules = (
  guide: string,
  lintRules: ReadonlySet<string>,
  file: string,
): string => {
  const items: string[] = [];
  for (const line of guide.split('\n')) {
    if (line.startsWith('- ')) items.push(line);
    else if (items.length && line.startsWith('  ')) items[items.length - 1] += ` ${line.trim()}`;
    else if (items.length && line.trim()) break;
  }
  if (!items.length) throw new Error(`${file}: no item`);
  return items
    .map((item) => {
      const rule = /^- \*\*(.+?)\*\*/.exec(item)?.[1];
      if (!rule)
        throw new Error(
          `${file}: the item "${item.slice(2, 62)}..." does not open with its rule in bold`,
        );
      const lint = [...new Set([...item.matchAll(/`magma\/([a-z-]+)`/g)].map(([, name]) => name!))];
      for (const name of lint)
        if (!lintRules.has(name))
          throw new Error(
            `${file}: the item "${rule}" names magma/${name}, not a rule of the lint`,
          );
      const checked = lint.length
        ? ` (lint: ${lint.map((name) => `\`magma/${name}\``).join(', ')})`
        : '';
      return `- ${unlink(rule).replace(/\.$/, '')}${checked}`;
    })
    .join('\n');
};
