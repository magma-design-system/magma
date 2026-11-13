import chalk from 'chalk';
import { TEMPLATES_DIR, DIST_DIR } from './meta';
import { readdir, readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join, relative } from 'path';
import Handlebars from 'handlebars';
import { PRE_HYDRATION_SUFFIX, preHydrationRules } from './hydrated-lib';

const COMPONENTS_DIR = '../stencil/src/components';

/*
  The box a component takes before it hydrates, on a page that does not render it on the server
  (#1409; #629 gave it to the server-rendered pages). A component that needs one writes it next
  to its sources as css/<tag>-pre-hydration.css: it knows the box its :host gives, and the two
  are reviewed together. This step appends those rules to hydrated.css, the sheet the page loads
  before the components; hydrated-lib.ts holds the form every rule must have.

  As properties.ts does, this reads the stencil SOURCES, never its build output (stencil depends
  on styles, the reverse would be a cycle); the files are inputs of the styles build in
  project.json, so the Nx cache invalidates when they change.
*/
const PRE_HYDRATION_HEADER = [
  '/*',
  '  The box a component takes before it hydrates, on a page that does not render it on the',
  '  server. Source: the <tag>/css/<tag>-pre-hydration.css files under',
  '  projects/stencil/src/components, collected by projects/styles/scripts/hydrated.ts.',
  '*/',
].join('\n');

const collectCss = async (dir: string): Promise<string[]> => {
  const found: string[] = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) found.push(...(await collectCss(full)));
    else if (entry.isFile() && entry.name.endsWith('.css')) found.push(full);
  }
  return found;
};

// A component sheet that imported one would inline document rules into its shadow root, where
// a tag selector never matches the host
const referencesOfPreHydrationSheets = async (): Promise<string[]> => {
  const references: string[] = [];
  for (const sheet of await collectCss(COMPONENTS_DIR)) {
    if (sheet.endsWith(PRE_HYDRATION_SUFFIX)) continue;
    if ((await readFile(sheet, 'utf8')).includes(PRE_HYDRATION_SUFFIX)) {
      references.push(relative(COMPONENTS_DIR, sheet));
    }
  }
  return references;
};

const preHydrationSheets = async (components: string[]): Promise<string[]> => {
  const chunks: string[] = [];
  for (const tag of components) {
    const file = join(COMPONENTS_DIR, tag, 'css', `${tag}${PRE_HYDRATION_SUFFIX}`);
    if (!existsSync(file)) continue;
    chunks.push(`/* ${tag} */\n${preHydrationRules(await readFile(file, 'utf8'), tag, file)}`);
  }
  return chunks;
};

const main = async () => {
  const componentsFolderContents = await readdir(COMPONENTS_DIR, { withFileTypes: true });
  const components = componentsFolderContents
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    // only include Stencil component tags/folders like "mds-foo-bar"
    .filter((name) => /^mds-[a-z0-9-]+$/.test(name))
    .sort();
  const hydratedTemplate = await readFile(join(TEMPLATES_DIR, 'hydrated.css.hbs')).catch(
    (error) => {
      throw new Error(chalk.red(error));
    },
  );
  const template = Handlebars.compile(hydratedTemplate.toString());
  const compiledHydratedComponents = template({ components });

  const references = await referencesOfPreHydrationSheets();
  if (references.length > 0) {
    console.error(
      chalk.red(
        `[hydrated] a component stylesheet references a ${PRE_HYDRATION_SUFFIX} file:\n` +
          references.map((reference) => `  ${reference}`).join('\n') +
          `\nThose rules ship in hydrated.css only: inside a shadow root they match nothing.`,
      ),
    );
    process.exit(1);
  }

  let sheets: string[];
  try {
    sheets = await preHydrationSheets(components);
  } catch (error) {
    console.error(chalk.red(`[hydrated] ${(error as Error).message}`));
    process.exit(1);
  }
  const hydrated =
    sheets.length === 0
      ? compiledHydratedComponents
      : `${compiledHydratedComponents}\n${PRE_HYDRATION_HEADER}\n\n${sheets.join('\n\n')}\n`;

  const hydratedFilePath = join(DIST_DIR, 'css', 'hydrated.css');
  await writeFile(hydratedFilePath, hydrated, { encoding: 'utf8' })
    .then(() => console.info('File overwrite'))
    .catch((error) => {
      throw new Error(chalk.red(error));
    });
  return Promise.resolve();
};

main();
