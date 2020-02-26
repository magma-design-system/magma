import React from 'react'
import { storiesOf } from '@storybook/react'
import Button from '../../Form/Button/Button'
import H1 from './H1'
import Page from '../../Page/Page'
import TypographicInfos from '../../Storybook/TypographicInfos/TypographicInfos'

import families from '../../../design-tokens/font-families.json'

const text = 'This is a H1 headline title'
const selector = 'text-sans text-sans--h1'

storiesOf('Typography/H1', module)
  .addDecorator(story => <Page>{story()}</Page>)
  .add('Default', () =>
    <TypographicInfos
      family={families.sans.family}
      properties={families.sans.styles.h1}
    >
      <H1>{text}</H1>
    </TypographicInfos>
  )
  .add('Custom tag', () => <H1 htmlTag='div'>{text}</H1>)
  .add('Avoid wrapper', () => <span className={selector}>Use <code>{selector}</code> CSS class to apply style without use container wrapper</span>)
  .add('Don\'t do this', () => <H1 htmlTag='div'>Don't use it as <Button icon="warning" action="warning">component wrapper</Button> to avoid useless HTML wrappers</H1>)
  .add('Do this', () => <H1>Use it if you have just <b>text nodes</b> or <b>inline components</b> like links, or bold, etc.</H1>)
