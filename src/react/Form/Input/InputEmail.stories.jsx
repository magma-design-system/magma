import React from 'react'

import { storiesOf } from '@storybook/react'
import Page from '../../Page/Page'

import InputEmail from './InputEmail'
import Button from '../Button/Button'

const Form = () => {
  const onSubmit = values => {
    console.log(values)
  }
  return (
    <form onSubmit={onSubmit}>
      <InputEmail name="pippo"/>
      <Button>Submit</Button>
    </form>
  )
}

storiesOf('Form/Input/Email', module)
  .addDecorator(story => <Page>{story()}</Page>)
  .add('Default', () =>
    <Form />
  )
