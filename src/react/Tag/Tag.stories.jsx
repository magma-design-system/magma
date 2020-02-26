import React from 'react'
import { storiesOf } from '@storybook/react'
import PropTypes from 'prop-types'
import Page from '../Page/Page'
import Tag from './Tag'

import colors from '../../design-tokens/colors.json'

const ExampleTagColor = props =>
  Object.entries(colors.palette.tones).map(([tone, toneValue]) =>
    <Tag iconClassName={`color-${props.tint}-${tone}`}>
      <code>color-{props.tint}-{tone}</code>
    </Tag>,
  )

ExampleTagColor.propTypes = {
  tint: PropTypes.string,
}

const paletteDictionary = Object.entries(colors.palette.colors).map(([tintName, tintValue]) =>
  <span style={{ display: 'inline-flex', alignItems: 'center', flexDirection: 'column' }}><ExampleTagColor tint={tintName}/></span>,
)

storiesOf('Tag', module)
  .addDecorator(story => <Page>{story()}</Page>)
  .add('Default', () => <Tag>Tag name</Tag>)
  .add('Color', () => <Tag iconClassName='color-orange-1'>Coffee</Tag>)
  .add('Palette dictionary', () =>
    <div className='grid' style={{ textAlign: 'center', gridTemplateColumns: 'repeat(3, 1fr)' }}>
      {paletteDictionary}
    </div>,
  )
