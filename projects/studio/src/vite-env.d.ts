/// <reference types="vite/client" />

declare module 'virtual:magma-api' {
  const components: import('../build/magma-api').ComponentAxes[];
  export default components;
}
