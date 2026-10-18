const BASE64_SVG_ICON = 'data:image/svg+xml;base64,';
const MARKUP_SVG_ICON = '<svg ';
// the markup of a saved .svg file: the XML declaration, a doctype and comments may come before
// the <svg> element, and its first attribute may be on the next line
const MARKUP_SVG_ICON_START =
  /^\s*(<\?xml[\s\S]*?\?>\s*)?(<!DOCTYPE[^>]*>\s*|<!--[\s\S]*?-->\s*)*<svg[\s>]/i;

const isIconFormatIsBase64 = (icon?: string): boolean => {
  if (!icon) {
    return false;
  }
  return icon.startsWith(BASE64_SVG_ICON);
};

const isIconFormatIsSVG = (icon?: string): boolean => {
  if (!icon) {
    return false;
  }
  return MARKUP_SVG_ICON_START.test(icon);
};

export { isIconFormatIsBase64, isIconFormatIsSVG, BASE64_SVG_ICON, MARKUP_SVG_ICON };
