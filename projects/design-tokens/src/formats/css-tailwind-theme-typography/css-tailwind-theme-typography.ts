import Handlebars, { HelperOptions } from 'handlebars';
import StyleDictionary from 'style-dictionary';
import fs from 'fs';
import path from 'path';
import { version } from '../../../package.json';
import { FormatterArguments } from 'style-dictionary/types/Format';
import {
  ifEquals,
  ifTailwindFontSizeProp,
  kebabCase,
  leadZero,
  rgbChannel,
  tailwindFontSize,
} from '../helpers';

const templatePath = path.resolve(__dirname, './template.hbs');
const template = Handlebars.compile(fs.readFileSync(templatePath).toString());

const ifTailwind4Border = (property: string, options: HelperOptions) => {
  /* exclude number and default value
    keep prop as sm, md...
  */
  return isNaN(Number(property)) ? options.fn(this) : options.inverse(this);
};

Handlebars.registerHelper('ifEquals', ifEquals);
Handlebars.registerHelper('leadZero', leadZero);
Handlebars.registerHelper('rgbChannel', rgbChannel);
Handlebars.registerHelper('kebabCase', kebabCase);
Handlebars.registerHelper('ifTailwindFontSizeProp', ifTailwindFontSizeProp);
Handlebars.registerHelper('tailwindFontSize', tailwindFontSize);
Handlebars.registerHelper('ifTailwind4Border', ifTailwind4Border);

export const tailwindCss4Filter = {
  name: 'tailwind/cssTailwind4Filter',
  matcher: function (token) {
    return !token.name.endsWith('default');
  },
};

export const cssTailwindThemeTypography: StyleDictionary.Format = {
  name: 'css/tailwind-theme-typography',
  formatter: ({ dictionary, platform }: FormatterArguments) => {
    return template({
      properties: dictionary.properties,
      date: new Date().toUTCString(),
      options: platform,
      version,
    });
  },
};
