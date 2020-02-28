import React from 'react'
import faker from 'faker'

import H3 from '@Typography/H3/H3'
import Paragraph from '@Typography/Paragraph/Paragraph'
import Button from './Form/Button/Button'
import Grid from './Layout/Grid/Grid'
import InputEmail from './Form/Input/InputEmail'
import InputPhone from './Form/Input/InputPhone'
import InputText from './Form/Input/InputText'
import Checkbox from './Form/Checkbox/Checkbox'
faker.locale = 'it'

export default {
  title: 'Policy App/Examples',
  component: Grid,
}

export const basicUsage = () =>
  <Grid>
    <H3>{faker.lorem.sentence()}</H3>
    <Paragraph>{faker.lorem.paragraph()}</Paragraph>
    <Grid columns="2">
      <InputText label="Nome" placeholder={faker.name.firstName()}/>
      <InputText label="Cognome" placeholder={faker.name.lastName()}/>
    </Grid>
    <InputPhone label="Telefono" placeholder={faker.phone.phoneNumber()}/>
    <InputEmail label="E-mail" placeholder={faker.internet.email()}/>
    <Checkbox>{faker.lorem.sentence()}</Checkbox>
    <Checkbox>{faker.lorem.sentence()}</Checkbox>
    <Checkbox>{faker.lorem.sentence()}</Checkbox>
    <Button>{faker.hacker.verb()}</Button>
  </Grid>

export const noLabels = () =>
  <Grid>
    <H3>{faker.lorem.sentence()}</H3>
    <Paragraph>{faker.lorem.paragraph()}</Paragraph>
    <Grid columns="2">
      <InputText placeholder="Nome"/>
      <InputText placeholder="Cognome"/>
    </Grid>
    <InputPhone placeholder="Telefono"/>
    <InputEmail placeholder="E-mail"/>
    <Checkbox>{faker.lorem.sentence()}</Checkbox>
    <Checkbox>{faker.lorem.sentence()}</Checkbox>
    <Checkbox>{faker.lorem.sentence()}</Checkbox>
    <Button>{faker.hacker.verb()}</Button>
  </Grid>
