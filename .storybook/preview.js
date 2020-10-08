import React from 'react';
import { addDecorator } from '@storybook/react';
import Page from '@Gatsby/Page/Page'
// import faker from 'faker'
// faker.locale = 'it'

// vendors
import '../node_modules/normalize.css/normalize.css'
import '../projects/mgg-icons/build/fonts/mgg-icons.css'
import '../node_modules/typeface-karla/index.css'
import '../node_modules/typeface-roboto/index.css'

// design system base styles
import './storybook.scss'
import '../src/scss/import-global.scss'

addDecorator(storyFn => <Page>{storyFn()}</Page>);
