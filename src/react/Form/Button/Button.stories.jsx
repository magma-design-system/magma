import React from 'react'
import PropTypes from 'prop-types'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'

import Page from '../../Page/Page'
import Button from './Button'
import actions from './ButtonDictionary'

const ExampleButton = props => <div>
  <Button {...props}>{props.action}</Button>
  <code style={{ marginLeft: '10px' }}>{props.action}</code>
</div>

ExampleButton.propTypes = {
  action: PropTypes.string.isRequired,
}

const dictionary = Object.entries(actions).map(([key, value]) =>
  <ExampleButton key={key} action={key} onClick={action('clicked')}/>
)

storiesOf('Form/Button', module)
  .addDecorator(story => <Page>{story()}</Page>)
  .add('Default', () =>
    <Button onClick={action('clicked')}>Hello world!</Button>
  )
  .add('Icon + text', () =>
    <Button onClick={action('clicked')} icon="settings">Change settings</Button>
  )
  .add('Small', () =>
    <Button onClick={action('clicked')} size="small">Change settings</Button>
  )
  .add('Icon + Small', () =>
    <Button onClick={action('clicked')} icon="settings" size="small">Change settings</Button>
  )
  .add('Disabled', () =>
    <Button onClick={action('clicked')} icon="settings" size="small" disabled={true}>Change settings</Button>
  )
  .add('Collapse', () =>
    <Button onClick={action('clicked')} icon="license" collapse={true}>Collapse on mobile</Button>
  )
  .add('Dictionary', () =>
    <div className='grid' style={{ gridTemplateColumns: '1fr' }}>
      <div>
        <Button>No action set</Button>
      </div>
      {dictionary}
    </div>
  )
