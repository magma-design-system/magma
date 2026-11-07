declare module '*?raw' {
  const content: string;
  export default content;
}

declare module 'virtual:magma-api' {
  const components: import('../magma-api').ComponentAxes[];
  export default components;
}
