// Browser stand-in for chalk: every style function returns its input.
const passthrough = (value: unknown) => String(value);

export default new Proxy(passthrough, {
  get: () => passthrough,
});
