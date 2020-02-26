import React, { useState } from 'react'
import { storiesOf } from '@storybook/react'
import Page from '../../Page/Page'

import InputText from './InputText'

const Form = () => {
  const [inputValue, onInputValue] = useState(null)
  const onSubmit = values => {
    console.log(values)
  }
  return (
    <form onSubmit={e => { onSubmit(e.target.value) }}>
      <InputText name="textField" onBlur={e => { onInputValue(e.target.value) }}/>
      {inputValue && <div>Value: inputValue</div>}
    </form>
  )
}

storiesOf('Form/Input/Text', module)
  .addDecorator(story => <Page>{story()}</Page>)
  .add('Basic usage', () =>
    <InputText label="This is a text field" placeholder="Placeholder"/>
  )
  .add('Form', () =>
    <Form/>
  )
