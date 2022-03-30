module.exports = {
  content: [
    './fragments/**/*.{tsx,ts,json}',
    './pages/**/*.{tsx,ts,json}',
  ],
  plugin: [
    require('@iconsauce/material-icons'),
    require('@iconsauce/mdi-svg'),
    require('@iconsauce/mgg-icons'),
  ],
}
