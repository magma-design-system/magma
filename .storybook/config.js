import { addParameters, configure, addDecorator } from '@storybook/react'
import { themes } from '@storybook/theming';
import { withInfo } from '@storybook/addon-info';

addDecorator(withInfo); 

import theme from './theme';

import '../node_modules/node-normalize-scss/_normalize.scss'
import '../node_modules/material-design-icons/iconfont/material-icons.css'
import '../node_modules/typeface-roboto/index.css'
import '../src/scss/import-global.scss'

addParameters({
  options: {
    /**
     * show story component as full screen
     * @type {Boolean}
     */
    isFullscreen: false,
    /**
     * display panel that shows a list of stories
     * @type {Boolean}
     */
    showNav: true,
    /**
     * display panel that shows addon configurations
     * @type {Boolean}
     */
    showPanel: false,
    /**
     * where to show the addon panel
     * @type {('bottom'|'right')}
     */
    panelPosition: 'bottom',
    /**
     * show/hide tool bar
     * @type {Boolean}
     */
    isToolshown: false,
    /**
     * theme storybook, see link below
     */
    theme: theme,
  },
});

// automatically import all files ending in *.stories.js
const req = require.context("../src/react", true, /\.stories\.jsx$/)
function loadStories() {
  req.keys().forEach(filename => req(filename))
}

configure(loadStories, module)
