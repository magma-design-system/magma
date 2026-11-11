import { toSimpleColor } from '../meta/color';

// the value of type="color" (#1260): the valid lowercase simple color of HTML, #rrggbb
describe('toSimpleColor', () => {
  it.each([
    ['#2f6fd0', '#2f6fd0'],
    ['#2F6FD0', '#2f6fd0'],
    ['2f6fd0', '#2f6fd0'],
    ['2F6FD0', '#2f6fd0'],
    ['#abc', '#aabbcc'],
    ['ABC', '#aabbcc'],
    ['#000', '#000000'],
    [' #a89586\n', '#a89586'],
  ])('reads %j as %s', (text, color) => {
    expect(toSimpleColor(text)).toBe(color);
  });

  it.each([
    ['', 'nothing'],
    ['#', 'no digit'],
    ['#abcd', 'the alpha of the short form'],
    ['#aabbccdd', 'the alpha of the long form'],
    ['#12345', 'five digits'],
    ['#ggghhh', 'a digit that is not hexadecimal'],
    ['red', 'a name'],
    ['rgb(0 0 0)', 'a function'],
    ['##abc', 'two #'],
    ['# abc', 'a space after #'],
  ])('finds no colour in %j, %s', (text) => {
    expect(toSimpleColor(text)).toBe('');
  });
});
