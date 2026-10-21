import {
  MdsValidatorFn,
  Validator,
  ccValidatorFn,
  emailValidatorFn,
  isbnValidatorFn,
  patternValidator,
  pivaValidatorFn,
  urlValidatorFn,
} from '../meta/validators';

let validator = new Validator();

const required: MdsValidatorFn = (input: string) => {
  return input.length !== 0 ? null : { required: 'string required' };
};

beforeEach(() => {
  validator = new Validator();
});

describe('validator', () => {
  describe('create new validator', () => {
    it('new validator should be valid', () => {
      expect(validator.isValid).toBeTruthy();
    });

    it('errors should be null', () => {
      expect(validator.errors).toBeNull();
    });
  });

  describe('validate empty validator with empty string', () => {
    validator.validate('');
    it('should be valid', () => {
      expect(validator.isValid).toBeTruthy();
    });
    it('errors should be null', () => {
      expect(validator.errors).toBeNull();
    });
  });

  describe('validate empty validator with string', () => {
    validator.validate('test');
    it('should be valid', () => {
      expect(validator.isValid).toBeTruthy();
    });
    it('errors should be null', () => {
      expect(validator.errors).toBeNull();
    });
  });

  describe('add validators', () => {
    it('has validator required', () => {
      validator.addValidator(required);
      expect(validator.hasValidator(required)).toBeTruthy();
    });
    it('has validator isbn', () => {
      validator.addValidator(isbnValidatorFn);
      expect(validator.hasValidator(isbnValidatorFn)).toBeTruthy();
    });
    it("hasn't validator", () => {
      expect(validator.hasValidator(required)).toBeFalsy();
      expect(validator.hasValidator(isbnValidatorFn)).toBeFalsy();
    });
  });

  describe('remove validator', () => {
    beforeEach(() => {
      validator.addValidator(required);
    });

    it('remove exist validator', () => {
      expect(validator.hasValidator(required)).toBeTruthy();
      validator.removeValidator(required);
      expect(validator.hasValidator(required)).toBeFalsy();
    });

    it('remove not exist validator', () => {
      expect(validator.hasValidator(required)).toBeTruthy();
      expect(validator.hasValidator(isbnValidatorFn)).toBeFalsy();

      validator.removeValidator(isbnValidatorFn);

      expect(validator.hasValidator(required)).toBeTruthy();
      expect(validator.hasValidator(isbnValidatorFn)).toBeFalsy();
    });
  });

  describe('isbn validator', () => {
    beforeEach(() => {
      validator.addValidator(isbnValidatorFn);
    });

    it('isbn-10 format correct', () => {
      validator.validate('885152159X');
      expect(validator.isValid).toBeTruthy();
      expect(validator.errors).toBeNull();
    });
    it('isbn-10 format correct', () => {
      validator.validate('8851521581');
      expect(validator.isValid).toBeTruthy();
      expect(validator.errors).toBeNull();
    });
    it('isbn-13 format correct', () => {
      validator.validate('9788843025343');
      expect(validator.isValid).toBeTruthy();
      expect(validator.errors).toBeNull();
    });
    it('isbn format incorrect', () => {
      validator.validate('test');
      expect(validator.isValid).toBeFalsy();
      expect(validator.errors).toEqual({
        'isbn-error': 'formato isbn non correto',
      });
    });

    it('isbn-10 not valid', () => {
      validator.validate('8851521599');
      expect(validator.isValid).toBeFalsy();
      expect(validator.errors).toEqual({
        'isbn-error': 'codice isbn non valido',
      });
    });
    it('isbn-13 not valid', () => {
      validator.validate('8851521599123');
      expect(validator.errors).toEqual({
        'isbn-error': 'codice isbn non valido',
      });
      expect(validator.isValid).toBeFalsy();
    });
  });
});

// the pattern attribute of a native input (#822)
describe('patternValidator', () => {
  it('checks the whole value, not a part of it', () => {
    const pattern = patternValidator('[A-Z]{3}')!;

    expect(pattern('ABC')).toBeNull();
    expect(pattern('ABCD')).toEqual({ pattern: 'formato non valido' });
    expect(pattern('xABC')).toEqual({ pattern: 'formato non valido' });
  });

  it('leaves an empty value to required', () => {
    expect(patternValidator('[A-Z]{3}')!('')).toBeNull();
  });

  it('wraps the alternatives before anchoring them', () => {
    const pattern = patternValidator('cat|dog')!;

    expect(pattern('dog')).toBeNull();
    expect(pattern('catdog')).toEqual({ pattern: 'formato non valido' });
  });

  it('sets no rule for an expression that does not compile, as the browser', () => {
    expect(patternValidator('(')).toBeNull();
  });
});

// the formats a native type="email" and type="url" check (#822)
describe('emailValidatorFn', () => {
  it.each(['mario.rossi@maggioli.it', 'a@b', "o'brien+tag@sub.example.com"])(
    'accepts %s',
    (email) => {
      expect(emailValidatorFn(email)).toBeNull();
    },
  );

  it.each(['mario', 'mario@', '@maggioli.it', 'mario rossi@maggioli.it', 'a@-b.it', 'a@b..it'])(
    'rejects %s',
    (email) => {
      expect(emailValidatorFn(email)).toEqual({ email: 'indirizzo email non valido' });
    },
  );

  it('leaves an empty value to required', () => {
    expect(emailValidatorFn('')).toBeNull();
  });
});

describe('urlValidatorFn', () => {
  it.each(['https://www.maggioli.it', 'mailto:a@b.it', 'ftp://host/file'])('accepts %s', (url) => {
    expect(urlValidatorFn(url)).toBeNull();
  });

  it.each(['www.maggioli.it', '/path', 'http://'])('rejects %s', (url) => {
    expect(urlValidatorFn(url)).toEqual({ url: 'url non valido' });
  });

  it('leaves an empty value to required', () => {
    expect(urlValidatorFn('')).toBeNull();
  });
});

// the formats of type="piva" and type="cc" (#822)
describe('pivaValidatorFn', () => {
  it.each(['02066400405', '12345678903'])('accepts %s', (piva) => {
    expect(pivaValidatorFn(piva)).toBeNull();
  });

  it.each([
    ['a wrong check digit', '12345678901'],
    ['10 digits', '0206640040'],
    ['the country prefix', 'IT02066400405'],
    ['spaces', '020 6640 0405'],
  ])('rejects %s', (_, piva) => {
    expect(pivaValidatorFn(piva)).toEqual({ piva: 'partita iva non valida' });
  });

  it('leaves an empty value to required', () => {
    expect(pivaValidatorFn('')).toBeNull();
  });
});

describe('ccValidatorFn', () => {
  it.each(['4111111111111111', '4111 1111 1111 1111', '4111-1111-1111-1111', '378282246310005'])(
    'accepts %s',
    (cc) => {
      expect(ccValidatorFn(cc)).toBeNull();
    },
  );

  it.each([
    ['a number that fails the Luhn check', '4111111111111112'],
    ['12 digits', '411111111111'],
    ['20 digits', '41111111111111111111'],
    ['a letter', '4111 1111 1111 111a'],
    ['two separators in a row', '4111  1111 1111 1111'],
    ['a leading separator', '-4111111111111111'],
  ])('rejects %s', (_, cc) => {
    expect(ccValidatorFn(cc)).toEqual({ cc: 'numero di carta non valido' });
  });

  it('leaves an empty value to required', () => {
    expect(ccValidatorFn('')).toBeNull();
  });
});

describe('check', () => {
  it('returns the errors without storing them', () => {
    const checked = new Validator();
    checked.addValidator(required);

    expect(checked.check('')).toEqual({ required: 'string required' });
    expect(checked.check('abc')).toBeNull();
    expect(checked.errors).toBeNull();
    expect(checked.isValid).toBe(true);
  });
});
