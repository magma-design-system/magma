import { negateExprText } from './negate.js';

describe('negateExprText', () => {
  it('collapses boolean literals', () => {
    expect(negateExprText('true')).toBe('false');
    expect(negateExprText('false')).toBe('true');
  });

  it('prefixes atomic expressions with a bare !', () => {
    expect(negateExprText('x')).toBe('!x');
    expect(negateExprText('a.b.c')).toBe('!a.b.c');
    expect(negateExprText('foo.bar()')).toBe('!foo.bar()');
    expect(negateExprText('items[0].open')).toBe('!items[0].open');
  });

  it('wraps compound expressions in parentheses', () => {
    expect(negateExprText('a && b')).toBe('!(a && b)');
    expect(negateExprText('a ? b : c')).toBe('!(a ? b : c)');
    expect(negateExprText('a === b')).toBe('!(a === b)');
  });

  it('strips a leading ! (double negation)', () => {
    expect(negateExprText('!x')).toBe('x');
    expect(negateExprText('!foo()')).toBe('foo()');
    expect(negateExprText('!(a && b)')).toBe('(a && b)');
  });

  it('does not strip a ! that only negates part of a compound expression', () => {
    expect(negateExprText('!a && b')).toBe('!(!a && b)');
  });

  it('trims surrounding whitespace', () => {
    expect(negateExprText('  x  ')).toBe('!x');
  });
});
