import Handlebars from 'handlebars';
import StyleDictionary from 'style-dictionary';
import fs from 'fs';
import path from 'path';
import { version } from '../../../package.json';
import { FormatterArguments } from 'style-dictionary/types/Format';
import { ifEquals, leadZero, rgbColor } from '../helpers';

const templatePath = path.resolve(__dirname, './template.hbs');
const template = Handlebars.compile(fs.readFileSync(templatePath).toString());

Handlebars.registerHelper('ifEquals', ifEquals);
Handlebars.registerHelper('leadZero', leadZero);
Handlebars.registerHelper('rgbColor', rgbColor);

export const cssTailwindThemeColor: StyleDictionary.Format = {
  name: 'css/css-tailwind-theme-color',
  formatter: ({ dictionary, platform }: FormatterArguments) => {
    return template({
      properties: dictionary.properties,
      date: new Date().toUTCString(),
      options: platform,
      version,
    });
  },
};
