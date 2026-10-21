/**
 * Safe wrappers around ElementInternals methods. In Stencil's hydrate/SSR
 * runtime (and in mock-doc spec tests) `@AttachInternals()` returns an inert
 * proxy whose members are all `undefined`, so direct calls like
 * `internals.setFormValue(...)` throw. Property reads (`internals.form`) are
 * safe and don't need these wrappers.
 */
const setFormValue = (
  internals: ElementInternals,
  value: string | File | FormData | null,
): void => {
  if (typeof internals?.setFormValue === 'function') {
    internals.setFormValue(value);
  }
};

const setValidity = (
  internals: ElementInternals,
  flags?: ValidityStateFlags,
  message?: string,
  anchor?: HTMLElement,
): void => {
  if (typeof internals?.setValidity === 'function') {
    internals.setValidity(flags, message, anchor);
  }
};

/**
 * Submits `form` as a native submit button with this `name` and `value` would. A custom
 * element cannot be the submitter of `requestSubmit()`, so a hidden native button stands in
 * for it for the length of the call: the receiver gets `name=value`, `event.submitter`
 * carries them, and `new FormData(form)` leaves them out unless it is given the submitter.
 */
const requestSubmitAs = (form: HTMLFormElement, name?: string, value?: string): void => {
  const submitter = form.ownerDocument.createElement('button');
  submitter.type = 'submit';
  submitter.hidden = true;
  // Angular and Vue bind null for a missing value, which a native button would send as "null"
  if (name != null) submitter.name = name;
  if (value != null) submitter.value = value;

  form.append(submitter);
  try {
    form.requestSubmit(submitter);
  } finally {
    submitter.remove();
  }
};

export { requestSubmitAs, setFormValue, setValidity };
