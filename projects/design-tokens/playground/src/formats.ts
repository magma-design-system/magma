import Handlebars from 'handlebars';
import hexTemplate from '../../src/formats/css-vars-hex/template.hbs?raw';
import rgbTemplate from '../../src/formats/css-vars-rgb/template.hbs?raw';
import gimpTemplate from '../../src/formats/gimp-palette/template.hbs?raw';
import { ifEquals, leadZero, rgbChannel, gimpRgbChannel } from '../../src/formats/helpers.js';
import { version } from '../../package.json';

// The CSS and GIMP outputs are Handlebars templates rendered over the token
// tree (dictionary.properties in Style Dictionary). That tree is the whole
// tokens object with its top-level `color` wrapper, e.g.
// { color: { tone: { porcelain: { light: {...}, dark: {...} } } } } for the
// base file, or an export group ({ color: {...} }); pass it verbatim so the
// browser reuses the exact same templates and helpers as the build.
type TokenTree = { color: Record<string, unknown> };

const handlebars = Handlebars.create();
handlebars.registerHelper('ifEquals', ifEquals);
handlebars.registerHelper('leadZero', leadZero);
handlebars.registerHelper('rgbChannel', rgbChannel);
handlebars.registerHelper('gimpRgbChannel', gimpRgbChannel);

const renderHex = handlebars.compile(hexTemplate);
const renderRgb = handlebars.compile(rgbTemplate);
const renderGimp = handlebars.compile(gimpTemplate);

// Style Dictionary lowercases hex values; the seed/base color keeps the
// config casing, so normalize hex occurrences to match the build output.
const lowerHex = (css: string): string =>
  css.replace(/#[0-9a-fA-F]{3,8}\b/g, (hex) => hex.toLowerCase());

/** CSS custom properties with hex values (light + dark theme selectors). */
export function cssHex(properties: TokenTree, date: string): string {
  return lowerHex(renderHex({ properties, version, date }));
}

/** CSS custom properties with space-separated RGB channels. */
export function cssRgb(properties: TokenTree, date: string): string {
  return renderRgb({ properties, version, date });
}

/** GIMP/Inkscape .gpl palette (light theme, contrast steps only). */
export function gimpPalette(properties: TokenTree): string {
  return renderGimp({ properties });
}
