/**
 * The props the stories' JSX passes to React, without the `false` booleans of the
 * form-associated components.
 *
 * The stories render the bare `mds-*` tags with React 18, which writes a prop set to `false`
 * on a custom element as the attribute `"false"`. A form-associated component reads a present
 * boolean attribute as set, `"false"` included, as a native control does (Stencil 4.45.2,
 * stenciljs/core#6908): a control switched off, an arg or a state set to `false` left the prop
 * on. Left out, the attribute is removed and the prop turns off: none of these components has
 * a boolean prop that defaults to `true`, as mds-video-wall does among the others.
 */

// `"false"` is a value of their own for these attributes
const ownFalse = /^(aria|data)-/;

const isFormAssociated = (type) =>
  typeof type === 'string' && customElements.get(type)?.formAssociated === true;

export const withoutFalse = (type, props) => {
  if (props == null || !isFormAssociated(type)) return props;
  return Object.fromEntries(
    Object.entries(props).filter(([name, value]) => value !== false || ownFalse.test(name)),
  );
};
