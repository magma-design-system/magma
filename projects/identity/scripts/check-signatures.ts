import chalk from 'chalk';
import { readdir, readFile } from 'fs/promises';
import path from 'path';
import { DIST_DIR } from './meta';

/*
  Every file of dist/ has to hold the format its extension names. The WebP files once held
  PNG bytes (exportWEBP encoded with .png()), and nothing noticed: browsers sniff the content
  and show them anyway, while image pipelines, CMS uploads and validators that trust the
  extension or the declared type reject them. Runs after the assets, as part of the build.
*/

const SIGNATURES: Record<string, (bytes: Buffer) => boolean> = {
  pdf: (bytes) => bytes.subarray(0, 4).toString('latin1') === '%PDF',
  png: (bytes) =>
    bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  svg: (bytes) => /<svg[\s>]/.test(bytes.subarray(0, 1024).toString('utf8')),
  webp: (bytes) =>
    bytes.subarray(0, 4).toString('latin1') === 'RIFF' &&
    bytes.subarray(8, 12).toString('latin1') === 'WEBP',
};

const walk = async (dir: string): Promise<string[]> =>
  (
    await Promise.all(
      (await readdir(dir, { withFileTypes: true })).map((entry) =>
        entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)],
      ),
    )
  ).flat();

const main = async (): Promise<void> => {
  const wrong: string[] = [];
  let checked = 0;
  for (const file of await walk(DIST_DIR)) {
    const matches = SIGNATURES[path.extname(file).slice(1)];
    if (!matches) continue;
    checked += 1;
    if (!matches(await readFile(file))) wrong.push(path.relative(DIST_DIR, file));
  }

  if (wrong.length > 0) {
    console.error(
      chalk.red(
        `${wrong.length} file(s) of dist/ do not hold the format of their extension:\n` +
          wrong.map((file) => `  ${file}`).join('\n'),
      ),
    );
    process.exit(1);
  }
  console.info(chalk.green(`${checked} files of dist/ hold the format of their extension`));
};

main();
