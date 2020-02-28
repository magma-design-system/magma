import React from 'react'
import { storiesOf } from '@storybook/react'
import Button from '../../Form/Button/Button'
import Page from '../../Page/Page'
import Paragraph from './Paragraph'
import TypographicInfos from '../../Storybook/TypographicInfos/TypographicInfos'

import families from '../../../design-tokens/font-families.json'

const text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
const selector = 'text-sans text-sans--paragraph'

storiesOf('Typography/Paragraph', module)
  .addDecorator(story => <Page>{story()}</Page>)
  .add('Default', () =>
    <TypographicInfos
      family={families.sans.family}
      properties={families.sans.styles.paragraph}
    >
      <Paragraph>{text}</Paragraph>
    </TypographicInfos>,
  )
  .add('Custom tag', () => <Paragraph htmlTag='div'>{text}</Paragraph>)
  .add('Avoid wrapper', () => <span className={selector}>Use <code>{selector}</code> CSS class to apply style without use container wrapper</span>)
  .add('Don\'t do this', () => <Paragraph htmlTag='div'>Don't use it as <Button icon="warning" action="warning">component wrapper</Button> to avoid useless HTML wrappers</Paragraph>)
  .add('Do this', () => <Paragraph>Use it if you have just <b>text nodes</b> or <b>inline components</b> like links, or bold, etc.</Paragraph>)
