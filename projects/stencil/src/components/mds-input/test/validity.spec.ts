import { validityProblem } from '../meta/validity';

describe('validityProblem', () => {
  it('reports a missing value', () => {
    expect(validityProblem({ required: '' }, {})).toEqual({ rule: 'required' });
  });

  it('reports the bounds with their values', () => {
    expect(validityProblem({ max: 'valore massimo 10' }, { max: 10 })).toEqual({
      rule: 'max',
      context: { max: 10 },
    });
    expect(validityProblem({ min: 'valore minimo 0' }, { min: 0 })).toEqual({
      rule: 'min',
      context: { min: 0 },
    });
  });

  // #1087: the two validators shared the key minLenght, and the value told them apart
  it('reports a value too long and one too short under their own keys', () => {
    const constraints = { maxlength: 4, minlength: 2 };

    expect(validityProblem({ maxlength: '' }, constraints)).toEqual({
      rule: 'maxlength',
      context: { maxlength: 4 },
    });
    expect(validityProblem({ minlength: '' }, constraints)).toEqual({
      rule: 'minlength',
      context: { minlength: 2 },
    });
  });

  it('reports a value that does not match the pattern', () => {
    expect(validityProblem({ pattern: 'formato non valido' }, {})).toEqual({
      rule: 'pattern',
    });
  });

  it('reports the format of an email or a URL as a native input does', () => {
    expect(validityProblem({ email: '' }, {})).toEqual({ rule: 'email' });
    expect(validityProblem({ url: '' }, {})).toEqual({ rule: 'url' });
  });

  it('reports a partita IVA or a card number that is not valid', () => {
    expect(validityProblem({ piva: '' }, {})).toEqual({ rule: 'vatNumber' });
    expect(validityProblem({ cc: '' }, {})).toEqual({ rule: 'cardNumber' });
  });

  // #1072: their message follows the language of the page, the form can take it
  it('gives the form the message of a type validator', () => {
    expect(validityProblem({ 'isbn-error': 'Invalid ISBN code' }, {})).toEqual({
      rule: 'invalid',
      message: 'Invalid ISBN code',
    });
  });

  it('keeps the message of a custom validator', () => {
    expect(validityProblem({ err: 'lower case' }, {})).toEqual({
      rule: 'invalid',
      message: 'lower case',
    });
  });

  it('reports the first validator that fails', () => {
    expect(validityProblem({ 'cf-regex': 'x', 'cf-length': 'y', err: 'z' }, {})).toEqual({
      rule: 'invalid',
      message: 'x',
    });
  });
});
