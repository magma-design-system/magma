import { isIconFormatIsSVG } from '@common/icon';

describe('isIconFormatIsSVG', () => {
  // #825: only markup opening with `<svg ` was taken for an icon, a saved .svg file was fetched
  // as a name
  it.each([
    ['<svg xmlns="http://www.w3.org/2000/svg"></svg>'],
    ['<svg\n  xmlns="http://www.w3.org/2000/svg"></svg>'],
    ['<svg></svg>'],
    ['  <svg xmlns="http://www.w3.org/2000/svg"></svg>'],
    ['<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg"></svg>'],
    [
      '<?xml version="1.0"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg></svg>',
    ],
    ['<!-- Generator: Adobe Illustrator --><svg version="1.1"></svg>'],
  ])('takes %j for markup', (icon) => {
    expect(isIconFormatIsSVG(icon)).toBe(true);
  });

  it.each([['mi/baseline/home'], ['<svgx></svgx>'], ['<div><svg></svg></div>'], [''], [undefined]])(
    'takes %j for no markup',
    (icon) => {
      expect(isIconFormatIsSVG(icon)).toBe(false);
    },
  );
});
