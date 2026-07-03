import Handlebars from 'handlebars';
import StyleDictionary from 'style-dictionary';
import fs from 'fs';
import path from 'path';
import { FormatterArguments } from 'style-dictionary/types/Format';
import { ifEquals, leadZero, gimpRgbChannel } from '../helpers';

const templatePath = path.resolve(__dirname, './template.hbs');
const template = Handlebars.compile(fs.readFileSync(templatePath).toString());

Handlebars.registerHelper('gimpRgbChannel', gimpRgbChannel);
Handlebars.registerHelper('leadZero', leadZero);
Handlebars.registerHelper('ifEquals', ifEquals);

export const gimpPaletteFormat: StyleDictionary.Format = {
  name: 'gimp/palette',
  formatter: ({ dictionary }: FormatterArguments) => {
    return template({
      properties: dictionary.properties,
    });
  },
};
