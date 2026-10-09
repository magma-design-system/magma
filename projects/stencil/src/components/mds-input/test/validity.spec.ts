import { validityProblem } from '../meta/validity';

describe('validityProblem', () => {
  it('reports a missing value', () => {
    expect(validityProblem({ required: '' }, '', {})).toEqual({ rule: 'required' });
  });

  it('reports the bounds with their values', () => {
    expect(validityProblem({ max: 'valore massimo 10' }, '11', { max: 10 })).toEqual({
      rule: 'max',
      context: { max: 10 },
    });
    expect(validityProblem({ min: 'valore minimo 0' }, '-1', { min: 0 })).toEqual({
      rule: 'min',
      context: { min: 0 },
    });
  });

  it('tells a value too long from one too short, which share their error key', () => {
    const constraints = { maxlength: 4, minlength: 2 };

    expect(validityProblem({ minLenght: '' }, 'abcdef', constraints)).toEqual({
      rule: 'maxlength',
      context: { maxlength: 4 },
    });
    expect(validityProblem({ minLenght: '' }, 'a', constraints)).toEqual({
      rule: 'minlength',
      context: { minlength: 2 },
    });
  });

  it('reports a value that does not match the pattern', () => {
    expect(validityProblem({ pattern: 'formato non valido' }, 'abc', {})).toEqual({
      rule: 'pattern',
    });
  });

  it('reports the format of an email or a URL as a native input does', () => {
    expect(validityProblem({ email: '' }, 'mario', {})).toEqual({ rule: 'email' });
    expect(validityProblem({ url: '' }, 'maggioli', {})).toEqual({ rule: 'url' });
  });

  it('reports a partita IVA or a card number that is not valid', () => {
    expect(validityProblem({ piva: '' }, '123', {})).toEqual({ rule: 'vatNumber' });
    expect(validityProblem({ cc: '' }, '123', {})).toEqual({ rule: 'cardNumber' });
  });

  it('gives the type validators the localized message instead of their Italian one', () => {
    expect(validityProblem({ 'isbn-error': 'codice isbn non valido' }, '123', {})).toEqual({
      rule: 'invalid',
      message: undefined,
    });
  });

  it('keeps the message of a custom validator', () => {
    expect(validityProblem({ err: 'lower case' }, 'abc', {})).toEqual({
      rule: 'invalid',
      message: 'lower case',
    });
  });

  it('reports the first validator that fails', () => {
    expect(validityProblem({ 'cf-regex': 'x', 'cf-length': 'y', err: 'z' }, 'abc', {})).toEqual({
      rule: 'invalid',
      message: undefined,
    });
  });
});
