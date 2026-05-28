import Handlebars from 'handlebars';
import chalk from 'chalk';
import { ask } from 'stdio';
import { mkdir, readFile, stat, writeFile } from 'fs/promises';
import { join } from 'path';
import { COMPONENTS_DIR, TEMPLATES_DIR } from './meta';
import { checkComponentExistance } from './lib';
import { dontUseWithNX, logFileSavedTo, logStatus } from '../../../scripts/log';

dontUseWithNX();

const componentNamePrefix = 'mds-';
const usageDirName = 'usage';
const usageFileStems = ['1. Description', '2. Pattern', '3. Antipattern'];

const capitalizeWord = (componentName: string) =>
  componentName
    .replace('-', ' ')
    .split(' ')
    .map((word: string) => `${word[0].toUpperCase()}${word.slice(1, word.length)}`)
    .join('');

const compileUsageFile = async (componentName: string, stem: string): Promise<void> => {
  const templateFileName = `${stem}.md.hbs`;
  const outputFileName = `${stem}.md`;
  const usageDir = join(COMPONENTS_DIR, componentName, usageDirName);
  const outputPath = join(usageDir, outputFileName);

  const exists = !!(await stat(outputPath).catch(() => false));
  if (exists) {
    console.warn(
      `File ${chalk.yellow(`${usageDirName}/${outputFileName}`)} ${chalk.yellow('previously created')}, skipping it.`,
    );
    return;
  }

  const templatePath = join(TEMPLATES_DIR, usageDirName, templateFileName);
  const templateRaw = await readFile(templatePath).catch((error) => {
    throw new Error(chalk.red(error));
  });

  const template = Handlebars.compile(templateRaw.toString());
  const data = {
    componentName,
    capitalizedComponentName: capitalizeWord(componentName),
    componentNameWithNoPrefix: componentName.split(componentNamePrefix)[1],
  };
  const rendered = template(data);

  await writeFile(outputPath, rendered, { encoding: 'utf8' })
    .then(() => logFileSavedTo(`${usageDirName}/${outputFileName}`, usageDir))
    .catch((error) => {
      throw new Error(chalk.red(error));
    });
};

const main = async () => {
  const inputName = await ask(`Component name ${componentNamePrefix}`);
  const componentName = `${componentNamePrefix}${inputName}`;

  const exist = await checkComponentExistance(componentName);

  if (!exist) {
    console.info(
      `Component ${componentName} ${chalk.red('not found')}, create it with ${chalk.blue('nx run stencil:generate')} first or enter another component name.`,
    );
    return;
  }

  logStatus({
    actionDoing: 'Usage docs from template generating',
    subject: componentName,
  });

  const usageDir = join(COMPONENTS_DIR, componentName, usageDirName);
  await mkdir(usageDir, { recursive: true }).catch((error) => {
    throw new Error(chalk.red(error));
  });

  for (const stem of usageFileStems) {
    await compileUsageFile(componentName, stem);
  }
};

main();
