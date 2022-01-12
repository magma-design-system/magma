module.exports = {
  content: [
    './node_modules/@maggioli-design-system/**/*.{js,jsx,ts,tsx}',
    './pages/**/*.{ts,tsx}',
    './fragments/**/*.{ts,tsx}',
    './layouts/**/*.{ts,tsx}',
  ],
  important: true,
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      gridTemplateColumns: {
        section: '340px auto',
      },
      opacity: {
        '85': '.85',
      },
      width: {
        aside: '340px',
      },
    },
  },
  presets: [
    require('@maggioli-design-system/styles'),
  ],
}
