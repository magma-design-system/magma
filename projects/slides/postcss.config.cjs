// Tailwind v4 via PostCSS, matching projects/styles. `@reference` in the input
// CSS makes utilities available to `@apply` without emitting any utility class
// or preflight, so the compiled output is self-contained and safe to inline.
module.exports = {
  plugins: [require('@tailwindcss/postcss')],
};
