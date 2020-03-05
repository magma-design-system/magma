import React from 'react'
import faker from 'faker'

import H3 from '@Typography/H3/H3'
import Paragraph from '@Typography/Paragraph/Paragraph'
import Button from '@Form/Button/Button'
import Grid from '../Policy/Layout/Grid/Grid'
import InputEmail from '@Form/Input/InputEmail'
import InputPhone from '@Form/Input/InputPhone'
import InputText from '@Form/Input/InputText'
import Checkbox from '@Form/Checkbox/Checkbox'
import Textarea from '@Form/Textarea/Textarea'
faker.locale = 'it'

export default {
  title: 'Form/Theming',
  component: Grid,
}

export const defaultTheme = () =>
  <Grid>
    <H3>{faker.lorem.sentence()}</H3>
    <Paragraph>{faker.lorem.paragraph()}</Paragraph>
    <Grid columns="2">
      <InputText label="Nome" placeholder={faker.name.firstName()}/>
      <InputText label="Cognome" placeholder={faker.name.lastName()}/>
    </Grid>
    <InputPhone label="Telefono" placeholder={faker.phone.phoneNumber()}/>
    <InputEmail label="E-mail" placeholder={faker.internet.email()}/>
    <Textarea label="Messaggio" placeholder="Scrivi il mesaggio qui..."></Textarea>
    <Checkbox>{faker.lorem.sentence()}</Checkbox>
    <Checkbox>{faker.lorem.sentence()}</Checkbox>
    <Checkbox>{faker.lorem.sentence()}</Checkbox>
    <Button>{faker.hacker.verb()}</Button>
  </Grid>
