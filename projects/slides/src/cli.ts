#!/usr/bin/env node
import arg from 'arg';
import chalk from 'chalk';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { parseDeck } from './parser/parse.js';
import { validateDeck } from './parser/schema.js';
import { exportHtml } from './export/html.js';
import { exportPdf } from './export/pdf.js';
import { applyUtilities } from './export/tailwind.js';

const spec = {
  '--out': String,
  '--pdf': String,
  '--theme': String,
  '--title': String,
  '--validate': Boolean,
  '--no-tailwind': Boolean,
  '--help': Boolean,
  '-o': '--out',
  '-h': '--help',
} as const;

function printUsage(): void {
  console.log(`magma-slides - generate Magma decks from Markdown + frontmatter

Usage:
  magma-slides build <deck.md> [options]

Options:
  -o, --out <file>    Output HTML file (default: <deck>.html)
      --pdf <file>    Also export a PDF to <file>
      --theme <name>  Theme override: maggioli | maggioli-dark
      --title <text>  Document title override
      --validate      Validate the deck against the schema (fails on errors)
      --no-tailwind   Skip generating author Tailwind utilities
  -h, --help          Show this help
`);
}

function deriveOut(input: string): string {
  return input.replace(/\.[^./]+$/, '') + '.html';
}

async function main(): Promise<void> {
  const args = arg(spec);

  if (args['--help'] || args._[0] !== 'build' || !args._[1]) {
    printUsage();
    process.exit(args['--help'] ? 0 : 1);
  }

  const input = args._[1];
  const source = readFileSync(input, 'utf8');
  const deck = parseDeck(source);

  const { valid, errors } = validateDeck(deck);
  if (!valid) {
    console.error(chalk.yellow(`Validation: ${errors.length} issue(s)`));
    for (const error of errors) console.error(`  - ${error}`);
    if (args['--validate']) process.exit(1);
  } else if (args['--validate']) {
    console.log(chalk.green('Deck is valid.'));
  }

  const options = { theme: args['--theme'], title: args['--title'], baseDir: dirname(input) };
  const tailwind = !args['--no-tailwind'];
  const out = args['--out'] ?? deriveOut(input);

  let html = exportHtml(deck, options);
  if (tailwind) html = await applyUtilities(html);
  writeFileSync(out, html);
  console.log(chalk.green(`HTML  ${out}`) + chalk.dim(`  (${deck.slides.length} slides)`));

  if (args['--pdf']) {
    const pdf = await exportPdf(deck, { ...options, tailwind });
    writeFileSync(args['--pdf'], pdf);
    console.log(chalk.green(`PDF   ${args['--pdf']}`));
  }
}

main().catch((error: unknown) => {
  console.error(chalk.red(error instanceof Error ? error.message : String(error)));
  process.exit(1);
});
