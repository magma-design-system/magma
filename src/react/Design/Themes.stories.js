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
  title: 'Design/Themes/Form',
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

export const dark = () =>
  <Grid>
    <H3>{faker.lorem.sentence()}</H3>
    <Paragraph>{faker.lorem.paragraph()}</Paragraph>
    <Grid columns="2">
      <InputText placeholder="Nome"/>
      <InputText placeholder="Cognome"/>
    </Grid>
    <InputPhone placeholder="Telefono"/>
    <InputEmail placeholder="E-mail"/>
    <Textarea placeholder="Messaggio"></Textarea>
    <Checkbox>{faker.lorem.sentence()}</Checkbox>
    <Checkbox>{faker.lorem.sentence()}</Checkbox>
    <Checkbox>{faker.lorem.sentence()}</Checkbox>
    <Button>{faker.hacker.verb()}</Button>
  </Grid>

export const maggioli = () =>
  <Grid>
    <H3>{faker.lorem.sentence()}</H3>
    <Paragraph>{faker.lorem.paragraph()}</Paragraph>
    <Grid columns="2">
      <Grid>
        <InputText placeholder="Nome"/>
        <InputText placeholder="Cognome"/>
        <InputEmail placeholder="E-mail"/>
      </Grid>
      <Grid>
        <Textarea placeholder="Messaggio"></Textarea>
      </Grid>
    </Grid>
    <Checkbox>{faker.lorem.sentence()}</Checkbox>
    <Checkbox>{faker.lorem.sentence()}</Checkbox>
    <Checkbox>{faker.lorem.sentence()}</Checkbox>
    <Button>{faker.hacker.verb()}</Button>
  </Grid>
