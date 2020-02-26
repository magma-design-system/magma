import React from 'react'
import { storiesOf } from '@storybook/react'
import PropTypes from 'prop-types'

import Icon from './Icon'
import Page from '../Page/Page'
import material from './dictionary.json'

const ExampleIcon = props => <div className="flex-row">
  <div>
    <Icon {...props} />
  </div>
  <code>{props.name}</code>
</div>

ExampleIcon.propTypes = {
  name: PropTypes.string.isRequired,
}

const iconDictionary = Object.entries(material).map(([key, value]) =>
  <ExampleIcon key={key} name={key}/>,
)

storiesOf('Icon', module)
  .addDecorator(story => <Page>{story()}</Page>)
  .add('Default', () => <Icon name='sendToMachine'/>)
  .add('Small', () => <Icon name='sendToMachine' size='small'/>)
  .add('Missing icon', () => <Icon name='expired'/>)
  .add('Icon dictionary', () =>
    <div>
      {iconDictionary}
    </div>,
  )
