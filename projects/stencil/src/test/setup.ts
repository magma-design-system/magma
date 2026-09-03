import { beforeAll } from 'vitest';

// The prebuilt lazy loader defines every mds-* element. It is imported inside beforeAll so
// that @stencil/vitest can patch customElements.define before the components register.
beforeAll(async () => {
  await import('../../www/build/magma-components.esm.js');
});

export {};
