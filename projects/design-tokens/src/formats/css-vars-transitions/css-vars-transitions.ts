import Handlebars from 'handlebars';
import StyleDictionary from 'style-dictionary';
import fs from 'fs';
import path from 'path';
import { version } from '../../../package.json';
import { FormatterArguments } from 'style-dictionary/types/Format';

const templatePath = path.resolve(__dirname, './template.hbs');
const template = Handlebars.compile(fs.readFileSync(templatePath).toString());

export const cssVarsTransitionsFormat: StyleDictionary.Format = {
  name: 'css/vars-transitions',
  formatter: ({ dictionary, platform }: FormatterArguments) => {
    return template({
      properties: dictionary.properties,
      date: new Date().toUTCString(),
      options: platform,
      version,
    });
  },
};
