import { preferenceStore } from '@common/preference';
import { updateValidity, validityMessage } from '@common/validity';

/** The part of ElementInternals the report touches. */
const internalsSpy = () => {
  const setValidity = vi.fn();
  return { internals: { setValidity } as unknown as ElementInternals, setValidity };
};

describe('updateValidity', () => {
  afterEach(() => {
    preferenceStore.state.language = 'en';
  });

  it('clears the report when there is no problem', () => {
    const { internals, setValidity } = internalsSpy();

    updateValidity(internals);

    expect(setValidity).toHaveBeenCalledWith({}, undefined, undefined);
  });

  it('reports the flag of the rule, its message and the anchor', () => {
    const { internals, setValidity } = internalsSpy();
    const anchor = document.createElement('input');

    updateValidity(internals, { rule: 'required' }, anchor);

    expect(setValidity).toHaveBeenCalledWith({ valueMissing: true }, 'Fill in this field.', anchor);
  });

  it.each([
    [{ rule: 'email' }, { typeMismatch: true }],
    [{ rule: 'invalid' }, { customError: true }],
    [{ rule: 'invalidDate' }, { badInput: true }],
    [{ rule: 'max', context: { max: 1 } }, { rangeOverflow: true }],
    [{ rule: 'maxDate', context: { max: '1/1/2026' } }, { rangeOverflow: true }],
    [{ rule: 'maxlength', context: { maxlength: 1 } }, { tooLong: true }],
    [{ rule: 'min', context: { min: 1 } }, { rangeUnderflow: true }],
    [{ rule: 'minDate', context: { min: '1/1/2026' } }, { rangeUnderflow: true }],
    [{ rule: 'minlength', context: { minlength: 1 } }, { tooShort: true }],
    [{ rule: 'pattern' }, { patternMismatch: true }],
    [{ rule: 'requiredSelect' }, { valueMissing: true }],
    [{ rule: 'url' }, { typeMismatch: true }],
  ] as const)('reports %o with %o', (problem, flags) => {
    const { internals, setValidity } = internalsSpy();

    updateValidity(internals, problem);

    expect(setValidity).toHaveBeenCalledWith(flags, expect.any(String), undefined);
  });

  it('does not throw without the ElementInternals methods, as under SSR', () => {
    expect(() => updateValidity({} as ElementInternals, { rule: 'required' })).not.toThrow();
  });
});

describe('validityMessage', () => {
  afterEach(() => {
    preferenceStore.state.language = 'en';
  });

  it('writes the values of the rule into the message', () => {
    expect(validityMessage({ rule: 'max', context: { max: 10 } })).toBe(
      'The value must be 10 or less.',
    );
  });

  it('picks the singular or the plural form from the count', () => {
    expect(validityMessage({ rule: 'minlength', context: { minlength: 1 } })).toBe(
      'Use at least 1 character.',
    );
    expect(validityMessage({ rule: 'minlength', context: { minlength: 3 } })).toBe(
      'Use at least 3 characters.',
    );
  });

  it('speaks the language of the page', () => {
    preferenceStore.state.language = 'it';

    expect(validityMessage({ rule: 'required' })).toBe('Compila questo campo.');
  });

  it('falls back to English for a language it does not have', () => {
    preferenceStore.state.language = 'fr';

    expect(validityMessage({ rule: 'required' })).toBe('Fill in this field.');
  });

  it('keeps a message of its own', () => {
    expect(validityMessage({ rule: 'invalid', message: 'lower case' })).toBe('lower case');
  });

  it('has every message in every language', () => {
    const rules = [
      'invalid',
      'invalidDate',
      'max',
      'maxDate',
      'maxlength',
      'min',
      'minDate',
      'minlength',
      'required',
      'requiredSelect',
    ] as const;
    const context = { max: 2, maxlength: 2, min: 2, minlength: 2 };
    ['el', 'en', 'es', 'it'].forEach((language) => {
      preferenceStore.state.language = language;
      rules.forEach((rule) => {
        const message = validityMessage({ rule, context });
        expect(typeof message, `${language} ${rule}`).toBe('string');
        expect(message, `${language} ${rule}`).not.toContain('{{');
      });
    });
  });
});
