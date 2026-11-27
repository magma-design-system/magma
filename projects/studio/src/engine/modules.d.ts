/*
  The types of the modules the engine reads that ship none (#1404, `strict` on): only what the
  studio and the sources of design-tokens it imports call. chroma-js has its own in @types/chroma-js.
*/

/** APCA, the contrast the gate measures text with (apca-w3, src/apca-w3.js). */
declare module 'apca-w3' {
  /**
   * The Lc of a text on a background, from their luminances: a signed number with the places of
   * -1, the default, a string with the places of 0 or more.
   */
  export function APCAcontrast(txtY: number, bgY: number, places?: number): number | string;
  /** The luminance of an sRGB colour: an array of 8-bit channels, a hex string or a number. */
  export function sRGBtoY(rgb?: readonly number[] | string | number): number;
}

/** The names of a colour (color-namer, index.js): the lists picked, each nearest first. */
declare module 'color-namer' {
  interface Named {
    name: string;
    hex: string;
    distance: number;
  }
  function namer(
    color: string,
    options?: { pick?: string[]; omit?: string[] },
  ): Record<string, Named[]>;
  export default namer;
}
