/**
 * The colour a text names, as the "valid lowercase simple color" of HTML (`#rrggbb`), the value a
 * native `<input type="color">` holds; `''` when the text is not a colour.
 *
 * Accepted, in upper or lower case and with the spaces a paste brings around it: the six digits
 * of the simple colour of HTML and the three of the short form of CSS (`#rgb`, each digit
 * doubled), each with or without the `#`, since Figma copies the code without it. Nothing else:
 * no alpha (`#rgba`, `#rrggbbaa`), since the field has no transparency, as a native colour input
 * has none, and no name or function (`red`, `rgb()`), which the field could not write back as the
 * code it holds (#1260).
 * Sources: HTML, "valid simple color" and "valid lowercase simple color"; CSS Color 4, hex notation.
 */
export const toSimpleColor = (text: string): string => {
  const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(text.trim());
  if (!match) return '';
  const digits = match[1].toLowerCase();
  return `#${digits.length === 3 ? digits.replace(/./g, '$&$&') : digits}`;
};
