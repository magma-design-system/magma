/**
 * Export every deck under examples/ (recursively) to dist/examples/, preserving
 * subfolders (HTML, plus PDF when run with `--pdf`). Exposed as the Nx target
 * `slides:build-examples` so example generation goes through Nx like every
 * other internal operation.
 *
 *   nx run slides:build-examples
 *   nx run slides:build-examples -- --pdf
 */
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
// Imports the BUILT package so the compiled dist/theme/slides.css (from
// slides.src.css) is inlined; the npm script runs `build` first.
import { parseDeck, validateDeck, exportHtml, exportPdf, applyUtilities } from '../dist/index.js';

async function main(): Promise<void> {
  const withPdf = process.argv.includes('--pdf');
  const examplesDir = fileURLToPath(new URL('../examples', import.meta.url));
  const outDir = fileURLToPath(new URL('../dist/examples', import.meta.url));

  const decks = readdirSync(examplesDir, { recursive: true })
    .map(String)
    .filter((file) => file.endsWith('.md'))
    .sort();
  let failures = 0;

  for (const rel of decks) {
    const name = rel.replace(/\.md$/, '');
    const source = readFileSync(join(examplesDir, rel), 'utf8');
    const deck = parseDeck(source);
    const baseDir = dirname(join(examplesDir, rel));

    const { valid, errors } = validateDeck(deck);
    const status = valid ? 'ok' : `INVALID (${errors.length})`;
    if (!valid) {
      failures += 1;
      for (const error of errors) console.error(`  ${name}: ${error}`);
    }

    const htmlPath = join(outDir, `${name}.html`);
    mkdirSync(dirname(htmlPath), { recursive: true });
    writeFileSync(htmlPath, await applyUtilities(exportHtml(deck, { baseDir })));
    if (withPdf) {
      writeFileSync(
        join(outDir, `${name}.pdf`),
        await exportPdf(deck, { baseDir, tailwind: true }),
      );
    }

    console.log(`${name} - ${deck.slides.length} slides [${status}]`);
  }

  console.log(`\n${decks.length} decks -> ${outDir}${withPdf ? ' (HTML + PDF)' : ' (HTML)'}`);
  if (failures > 0) process.exit(1);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
