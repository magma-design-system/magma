import { setValidity } from '@common/form';
import { Locale } from '@common/locale';
import localeEl from './locale.el.json';
import localeEn from './locale.en.json';
import localeEs from './locale.es.json';
import localeIt from './locale.it.json';

/** The rule a value breaks: it picks the validity flag and the message reported to the form. */
type ValidityRule =
  | 'invalid'
  | 'invalidDate'
  | 'max'
  | 'maxDate'
  | 'maxlength'
  | 'min'
  | 'minDate'
  | 'minlength'
  | 'required'
  | 'requiredSelect';

type ValidityProblem = {
  rule: ValidityRule;
  /** The values the message interpolates: `max`, `min`, `maxlength`, `minlength`. */
  context?: Record<string, string | number>;
  /** Replaces the built-in message, e.g. with the one of a custom validator. */
  message?: string;
};

const flags: Record<ValidityRule, keyof ValidityStateFlags> = {
  invalid: 'customError',
  invalidDate: 'badInput',
  max: 'rangeOverflow',
  maxDate: 'rangeOverflow',
  maxlength: 'tooLong',
  min: 'rangeUnderflow',
  minDate: 'rangeUnderflow',
  minlength: 'tooShort',
  required: 'valueMissing',
  requiredSelect: 'valueMissing',
};

const messages = new Locale({ el: localeEl, en: localeEn, es: localeEs, it: localeIt });

/** The message of a problem, in the language of the page. */
const validityMessage = ({ rule, context, message }: ValidityProblem): string =>
  message || messages.get(rule, context);

/**
 * Reports to the form the problem of a form-associated component, or clears it when there is
 * none: like a native control, an invalid component matches `:invalid` and stops the submit of
 * its form, which shows the message next to the anchor and focuses it.
 * @param internals the ElementInternals of the component
 * @param problem the rule the value breaks, `undefined` when the value is valid
 * @param anchor the control of the shadow tree the browser points the message at
 */
const updateValidity = (
  internals: ElementInternals,
  problem?: ValidityProblem,
  anchor?: HTMLElement,
): void => {
  if (problem === undefined) {
    setValidity(internals, {});
    return;
  }
  setValidity(internals, { [flags[problem.rule]]: true }, validityMessage(problem), anchor);
};

export { updateValidity, validityMessage };
export type { ValidityProblem, ValidityRule };
