import React from 'react';
import { addDecorator } from '@storybook/react';
import Page from '@System/Page/Page'
// import faker from 'faker'
// faker.locale = 'it'

import '../node_modules/material-design-icons/iconfont/material-icons.css'
import '../node_modules/typeface-karla/index.css'
import '../node_modules/typeface-roboto/index.css'
import '../src/scss/import-global.scss'

addDecorator(storyFn => <Page>{storyFn()}</Page>);
