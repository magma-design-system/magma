import React from 'react';
import { addDecorator } from '@storybook/react';
import Page from '../src/react/Storybook/Page/Page'

import '../node_modules/material-design-icons/iconfont/material-icons.css'
import '../node_modules/typeface-roboto/index.css'
import '../src/scss/import-global.scss'

addDecorator(storyFn => <Page>{storyFn()}</Page>);
