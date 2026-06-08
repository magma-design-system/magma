import Handlebars, { HelperOptions } from 'handlebars';
import StyleDictionary from 'style-dictionary';
import fs from 'fs';
import path from 'path';
import { version } from '../../../package.json';
import { FormatterArguments } from 'style-dictionary/types/Format';
import {
  ifTailwindFontSizeProp,
  kebabCase,
  pixelToRem,
  safeString,
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

// Register every helper used by ./template.hbs so this format is self-contained
// and not dependent on another module registering them first on the shared
// Handlebars singleton.
Handlebars.registerHelper('kebabCase', kebabCase);
Handlebars.registerHelper('ifTailwindFontSizeProp', ifTailwindFontSizeProp);
Handlebars.registerHelper('tailwindFontSize', tailwindFontSize);
Handlebars.registerHelper('pixelToRem', pixelToRem);
Handlebars.registerHelper('safeString', safeString);
Handlebars.registerHelper('ifTailwind4Border', ifTailwind4Border);

/**
 * Classic-CSS counterpart of `css/tailwind-theme-typography`: emits the same
 * typography (and related) custom properties inside a plain `:root {}` block
 * instead of Tailwind v4's `@theme {}`, so they can be consumed without a
 * Tailwind toolchain.
 */
export const cssVarsTypographyFormat: StyleDictionary.Format = {
  name: 'css/vars-typography',
  formatter: ({ dictionary, platform }: FormatterArguments) => {
    return template({
      properties: dictionary.properties,
      date: new Date().toUTCString(),
      options: platform,
      version,
    });
  },
};
