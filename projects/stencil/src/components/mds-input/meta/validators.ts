export interface MdsValidationErrors {
  [key: string]: string;
}

export type MdsValidatorFn = (input: string) => null | MdsValidationErrors;

export const NullValidator: MdsValidatorFn = () => null;

export const requiredValidor: MdsValidatorFn = (input: string) => {
  return input.length > 0 ? null : { required: '' };
};

export const maxValidator = (max: number): MdsValidatorFn => {
  return (input: string): MdsValidationErrors | null => {
    if (input === '' || max === null) {
      return null; // don't validate empty values to allow optional controls
    }
    const value = parseFloat(input);
    // Controls with NaN values after parsing should be treated as not having a
    // maximum, per the HTML forms spec: https://www.w3.org/TR/html5/forms.html#attr-input-max
    return !isNaN(value) && value > max ? { max: `valore massimo ${max}` } : null;
  };
};

export const minValidator = (min: number): MdsValidatorFn => {
  return (input: string): MdsValidationErrors | null => {
    if (input === '' || min === null) {
      return null; // don't validate empty values to allow optional controls
    }
    const value = parseFloat(input);
    // Controls with NaN values after parsing should be treated as not having a
    // minimum, per the HTML forms spec: https://www.w3.org/TR/html5/forms.html#attr-input-min
    return !isNaN(value) && value < min ? { min: `valore minimo ${min}` } : null;
  };
};

export const maxLenghtValidator = (length: number): MdsValidatorFn => {
  return (input: string): MdsValidationErrors | null => {
    if (input === '' || length === null) {
      return null; // don't validate empty values to allow optional controls
    }
    return input.length > length
      ? { minLenght: `La lunghezza massima accettata è ${length}` }
      : null;
  };
};

export const minLenghtValidator = (length: number): MdsValidatorFn => {
  return (input: string): MdsValidationErrors | null => {
    if (input === '' || length === null) {
      return null; // don't validate empty values to allow optional controls
    }
    return input.length < length
      ? { minLenght: `La lunghezza minima accettata è ${length}` }
      : null;
  };
};

// the flag the browsers compile the pattern attribute with: v in the current HTML spec, u before it
const patternFlags = ((): string => {
  try {
    return RegExp('', 'v').flags;
  } catch {
    return 'u';
  }
})();

/**
 * The rule of the `pattern` attribute of a native input: the whole value matches the expression.
 * An expression that does not compile sets no rule, as in the browser: `null` then.
 */
export const patternValidator = (pattern: string): MdsValidatorFn | null => {
  let expression: RegExp;
  try {
    expression = new RegExp(`^(?:${pattern})$`, patternFlags);
  } catch {
    return null;
  }
  return (input: string): MdsValidationErrors | null => {
    if (input === '') return null; // don't validate empty values to allow optional controls
    return expression.test(input) ? null : { pattern: 'formato non valido' };
  };
};

// the valid email address of the HTML spec, the one a native type="email" checks
const emailExpression =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

export const emailValidatorFn: MdsValidatorFn = (input: string) => {
  if (input === '') return null; // don't validate empty values to allow optional controls
  return emailExpression.test(input) ? null : { email: 'indirizzo email non valido' };
};

// a native type="url" accepts an absolute URL, the one the URL parser reads without a base
export const urlValidatorFn: MdsValidatorFn = (input: string) => {
  if (input === '') return null; // don't validate empty values to allow optional controls
  try {
    new URL(input);
    return null;
  } catch {
    return { url: 'url non valido' };
  }
};

/**
 * An Italian partita IVA: 11 digits, the last one the check digit of the first ten (the digits in
 * odd position summed as they are, the ones in even position doubled, minus 9 above 9).
 */
export const pivaValidatorFn: MdsValidatorFn = (input: string) => {
  if (input === '') return null; // don't validate empty values to allow optional controls
  const error = { piva: 'partita iva non valida' };
  if (!/^\d{11}$/.test(input)) return error;
  const digits = input.split('').map(Number);
  const sum = digits.slice(0, 10).reduce((total, digit, index) => {
    if (index % 2 === 0) return total + digit;
    const doubled = digit * 2;
    return total + (doubled > 9 ? doubled - 9 : doubled);
  }, 0);
  return (10 - (sum % 10)) % 10 === digits[10] ? null : error;
};

/**
 * A payment card number: 13 to 19 digits, in groups split by spaces or dashes, that pass the Luhn
 * check.
 */
export const ccValidatorFn: MdsValidatorFn = (input: string) => {
  if (input === '') return null; // don't validate empty values to allow optional controls
  const error = { cc: 'numero di carta non valido' };
  if (!/^\d+(?:[ -]\d+)*$/.test(input)) return error;
  const digits = input.replace(/[ -]/g, '');
  if (digits.length < 13 || digits.length > 19) return error;
  // from the right, every second digit doubled, minus 9 above 9
  const sum = digits
    .split('')
    .reverse()
    .map(Number)
    .reduce((total, digit, index) => {
      if (index % 2 === 0) return total + digit;
      const doubled = digit * 2;
      return total + (doubled > 9 ? doubled - 9 : doubled);
    }, 0);
  return sum % 10 === 0 ? null : error;
};

export const isbnValidatorFn: MdsValidatorFn = (input: string) => {
  if (input === '') return null; // don't validate empty values to allow optional controls

  if (Number.isNaN(input.slice(0, -1)) || (input.length !== 10 && input.length !== 13))
    return { 'isbn-error': 'formato isbn non correto' };

  const v: number[] = input.split('').map((v) => (v === 'X' ? 10 : Number(v)));

  let check = 0;
  // check isbn-10
  if (input.length === 10) {
    const numVerify = v.reduce((prev, curr, i) => {
      return prev + (10 - i) * curr;
    }, 0);

    check = numVerify % 11;
  } else {
    // check isbn-13
    const numVerify = v.reduce((prev, curr, i) => {
      const multiply = i % 2 === 0 ? 1 : 3;
      return prev + curr * multiply;
    }, 0);
    check = numVerify % 10;
  }
  return check === 0 ? null : { 'isbn-error': 'codice isbn non valido' };
};

export class Validator {
  private _validators: MdsValidatorFn[];

  private _errors: MdsValidationErrors | null;
  isValid: boolean;

  constructor() {
    this._validators = [];
    this._errors = null;
    this.isValid = true;
  }

  addValidator(validator: MdsValidatorFn | MdsValidatorFn[]): void {
    if (Array.isArray(validator)) {
      this._validators.push(...validator);
    } else {
      this._validators.push(validator);
    }
  }

  private _hasValidator(
    validators: MdsValidatorFn | MdsValidatorFn[],
    validator: MdsValidatorFn,
  ): boolean {
    return Array.isArray(validators) ? validators.includes(validator) : validators === validator;
  }

  hasValidator(validator?: MdsValidatorFn): boolean {
    return validator
      ? this._hasValidator(this._validators, validator)
      : this._validators.length > 0;
  }

  removeValidator(validator: MdsValidatorFn | MdsValidatorFn[]): void {
    this._validators = this._validators.filter((v) => !this._hasValidator(validator, v));
  }

  /**
   * Returns the errors of a value without storing them: `errors` and `isValid` keep the ones of
   * the last `validate`.
   */
  check(value: string): MdsValidationErrors | null {
    const res = this._validators
      .map((v) => v(value))
      .reduce((prev, curr) => ({ ...prev, ...curr }), NullValidator);
    return Object.keys(res).length === 0 ? null : res;
  }

  validate(value: string): void {
    this._errors = this.check(value);
    this.isValid = !this._errors;
  }

  get errors(): MdsValidationErrors | null {
    return this._errors;
  }
}
