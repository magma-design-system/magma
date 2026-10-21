/**
 * The stories are typed with Stencil's JSX (the `h` factory of tsconfig.json, so every `mds-*`
 * tag is checked against its props) but rendered by React (`.storybook/main.mjs`). React reads
 * `key` from any element, a function component of a story included: Stencil's JSX has no
 * `IntrinsicAttributes` to say so.
 *
 * Out of the build (tsconfig.stencil.json): in a Stencil functional component `key` is a prop
 * like any other.
 */
import '@stencil/core';

declare module '@stencil/core' {
  export namespace h {
    namespace JSX {
      interface IntrinsicAttributes {
        key?: string | number;
      }
    }
  }
}
