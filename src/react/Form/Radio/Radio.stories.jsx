import React, { Fragment, useState } from 'react'
import { storiesOf } from '@storybook/react'
import Page from '../../Page/Page'

import Radio from './Radio'

const DefaultRadios = props => {
  const [radioValue, toggleRadio] = useState(0)
  return (
    <Fragment>
      <Radio value={33} onChange={value => { toggleRadio(value) }}>
        First radio is 33
      </Radio>
      <Radio value={12} onChange={value => { toggleRadio(value) }}>
        Second radio is 12
      </Radio>
      <div>
        Cheked value is: <b>{radioValue}</b>
      </div>
    </Fragment>
  )
}

storiesOf('Form/Radio', module)
  .addDecorator(story => <Page>{story()}</Page>)
  .add('Default', () =>
    <DefaultRadios/>
  )
  .add('Checked by default', () =>
    <Fragment>
      <Radio isChecked={true} value={42}>
        First radio button checked
      </Radio>
      <Radio value={107}>
        Second radio button
      </Radio>
    </Fragment>
  )
  .add('Custom icon', () =>
    <Fragment>
      <div>Show:</div>
      <Radio isChecked={true} value={42} icon="error">
        Errors
      </Radio>
      <Radio value={107} icon="warning">
        Warnings
      </Radio>
    </Fragment>
  )
  .add('Custom color', () =>
    <Fragment>
      <div>Show:</div>
      <Radio isChecked={true} value={42} icon="error" iconClassName="color-red-2">
        Errors
      </Radio>
      <Radio value={107} icon="warning" iconClassName="color-yellow-1">
        Warnings
      </Radio>
    </Fragment>
  )
