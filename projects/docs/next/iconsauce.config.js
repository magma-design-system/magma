module.exports = {
  content: [
    './fragments/**/*.{tsx,ts,json}',
    './pages/**/*.{tsx,ts,json}',
  ],
  plugin: [
    require('@iconsauce/material-design-icons-updated'),
    require('@iconsauce/mdi-svg'),
    require('@iconsauce/mgg-icons'),
  ],
}
