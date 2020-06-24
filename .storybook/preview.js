import React from 'react';
import { addDecorator } from '@storybook/react';
import Page from '@System/Page/Page'
// import faker from 'faker'
// faker.locale = 'it'

import '../src/scss/default-assets.scss'
import '../src/scss/import-global.scss'

addDecorator(storyFn => <Page>{storyFn()}</Page>);
