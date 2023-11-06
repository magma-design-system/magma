/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/*.ts',
  ],
  important: false,
  corePlugins: {
    preflight: false,
  },
  presets: [
    require('@maggioli-design-system/styles'),
  ],
}
