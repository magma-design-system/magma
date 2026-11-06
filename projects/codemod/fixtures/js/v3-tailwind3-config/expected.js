// a Tailwind 3 config: the strings are reported with the rewrite to make
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: 'rgb(var(--magma-accent) / <alpha-value>)',
        raised: 'rgb(var(--magma-surface-raised))',
        brand: 'rgb(var(--brand-rgb) / <alpha-value>)',
      },
    },
  },
};
