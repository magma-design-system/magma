import Handlebars from 'handlebars';
import StyleDictionary from 'style-dictionary';
import fs from 'fs';
import path from 'path';
import { version } from '../../../package.json';
import { FormatterArguments } from 'style-dictionary/types/Format';
import { ifEquals, leadZero } from '../helpers';
import { darkSchemeTemplateData } from '../dark-scheme';

const templatePath = path.resolve(__dirname, './template.hbs');
const template = Handlebars.compile(fs.readFileSync(templatePath).toString());

Handlebars.registerHelper('ifEquals', ifEquals);
Handlebars.registerHelper('leadZero', leadZero);

export const cssHexFormat: StyleDictionary.Format = {
  name: 'css/vars',
  formatter: ({ dictionary, platform }: FormatterArguments) => {
    return template({
      properties: dictionary.properties,
      dark: darkSchemeTemplateData,
      date: new Date().toUTCString(),
      options: platform,
      version,
    });
  },
};
