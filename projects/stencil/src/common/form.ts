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

export { setFormValue, setValidity };
