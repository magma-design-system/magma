const { content } = require('@maggioli-design-system/styles');

module.exports = {
  // content is empty because we use stencil to build css and avoid unused utility classes between components
  content: [],
  important: false,
  corePlugins: {
    preflight: false,
  },
  presets: [
    require('@maggioli-design-system/styles'),
  ],
}
