import 'normalize.css'
import '@maggioli-design-system/styles/dist/css/colors-rgb.css'
import '@maggioli-design-system/styles/dist/css/globals.css'
import '@maggioli-design-system/styles/dist/css/reset.css'
import '@maggioli-design-system/styles/dist/css/base.css'
import '@fontsource/karla/400.css'
import '@fontsource/karla/700.css'
import '@fontsource/merriweather/300.css'
import '@fontsource/merriweather/400.css'
import '@fontsource/merriweather/700.css'
import '@fontsource/roboto-mono/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import '@fontsource/roboto/900.css'
import './tailwind.css'

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
}
