import { ValidityProblem } from '@common/validity';
import { MdsValidationErrors } from './validators';

// the validators of the type carry an Italian message: the form gets the localized one instead
const typeErrors = ['cf-length', 'cf-regex', 'isbn-error'];

export interface ValidityConstraints {
  max?: number;
  maxlength?: number;
  min?: number;
  minlength?: number;
}

/**
 * The problem reported to the form for the errors of a value. The first validator that fails
 * decides it: the ones of the type come first, then required, max, min, maxlength, minlength,
 * pattern and the custom ones last, which keep their own message.
 */
export const validityProblem = (
  errors: MdsValidationErrors,
  value: string,
  constraints: ValidityConstraints,
): ValidityProblem => {
  const [key] = Object.keys(errors);
  switch (key) {
    case 'required':
      return { rule: 'required' };
    case 'max':
      return { rule: 'max', context: { max: constraints.max! } };
    case 'min':
      return { rule: 'min', context: { min: constraints.min! } };
    // the maxlength and minlength validators share this key
    case 'minLenght':
      return constraints.maxlength !== undefined && value.length > constraints.maxlength
        ? { rule: 'maxlength', context: { maxlength: constraints.maxlength } }
        : { rule: 'minlength', context: { minlength: constraints.minlength! } };
    case 'pattern':
      return { rule: 'pattern' };
    case 'email':
      return { rule: 'email' };
    case 'url':
      return { rule: 'url' };
    default:
      return { rule: 'invalid', message: typeErrors.includes(key) ? undefined : errors[key] };
  }
};
