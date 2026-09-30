import { invertBoolean, remapEnum } from './attribute-ops.js';
import { bareTrue, boolLiteral, stringLiteral, dynamic } from './value-model.js';

describe('invertBoolean (arrow → hideArrow, oldDefault true / newDefault false)', () => {
  const newDefault = false;

  it('omits the prop when the old value is true (bare / {true} / "true")', () => {
    expect(invertBoolean(bareTrue(), newDefault)).toEqual({ action: 'omit' });
    expect(invertBoolean(boolLiteral(true), newDefault)).toEqual({ action: 'omit' });
    expect(invertBoolean(stringLiteral('true'), newDefault)).toEqual({ action: 'omit' });
  });

  it('emits shorthand true when the old value is false ({false} / "false")', () => {
    expect(invertBoolean(boolLiteral(false), newDefault)).toEqual({ action: 'shorthandTrue' });
    expect(invertBoolean(stringLiteral('false'), newDefault)).toEqual({ action: 'shorthandTrue' });
  });

  it('emits the negated expression when the old value is dynamic', () => {
    expect(invertBoolean(dynamic('open'), newDefault)).toEqual({ action: 'expr', expr: '!open' });
    expect(invertBoolean(dynamic('a && b'), newDefault)).toEqual({
      action: 'expr',
      expr: '!(a && b)',
    });
    expect(invertBoolean(dynamic('!open'), newDefault)).toEqual({ action: 'expr', expr: 'open' });
  });
});

describe('invertBoolean with newDefault true', () => {
  it('omits when the new value equals the (true) default, else emits explicit false', () => {
    // old false → new true === newDefault → omit
    expect(invertBoolean(boolLiteral(false), true)).toEqual({ action: 'omit' });
    // old true → new false !== newDefault → explicit false
    expect(invertBoolean(bareTrue(), true)).toEqual({ action: 'explicitFalse' });
  });
});

describe('remapEnum', () => {
  const map = { ghost: 'outline', quiet: 'text' };
  const v2set = ['outline', 'strong', 'text', 'weak'] as const;

  it('renames a mapped value validated against the v2 set', () => {
    expect(remapEnum(stringLiteral('ghost'), map, v2set)).toEqual({
      action: 'rename',
      value: 'outline',
    });
  });

  it('keeps a value already valid in v2', () => {
    expect(remapEnum(stringLiteral('strong'), map, v2set)).toEqual({ action: 'keep' });
  });

  it('flags a value that has no v2 equivalent (null target)', () => {
    expect(remapEnum(stringLiteral('quiet'), { quiet: null }, ['strong', 'weak'])).toMatchObject({
      action: 'flag',
    });
  });

  it('flags a literal absent from the v2 set', () => {
    expect(remapEnum(stringLiteral('text'), map, ['strong', 'weak'])).toMatchObject({
      action: 'flag',
    });
  });

  it('flags dynamic values', () => {
    expect(remapEnum(dynamic('tone'), map, v2set)).toMatchObject({ action: 'flag' });
  });
});
