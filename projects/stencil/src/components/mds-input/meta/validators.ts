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

  validate(value: string): void {
    const res = this._validators
      .map((v) => v(value))
      .reduce((prev, curr) => ({ ...prev, ...curr }), NullValidator);
    this._errors = Object.keys(res).length === 0 ? null : res;
    this.isValid = !this._errors;
  }

  get errors(): MdsValidationErrors | null {
    return this._errors;
  }
}
