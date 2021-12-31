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
        'section': '340px auto',
      },
    },
  },
  presets: [
    require('@maggioli-design-system/styles'),
  ],
}
