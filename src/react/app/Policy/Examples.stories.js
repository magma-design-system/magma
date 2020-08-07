import React from 'react'
import faker from 'faker'

import H3 from '@Typography/H3/H3'
import Paragraph from '@Typography/Paragraph/Paragraph'
import Button from '@Form/Button/Button'
import Grid from './Layout/Grid/Grid'
import InputEmail from '@Form/Input/InputEmail'
import InputPhone from '@Form/Input/InputPhone'
import InputText from '@Form/Input/InputText'
import Select, { SelectOption } from '@Form/Select/Select'
import Checkbox from '@Form/Checkbox/Checkbox'
import Textarea from '@Form/Textarea/Textarea'
faker.locale = 'it'

export default {
  title: 'Policy App/Layout',
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
    <Grid columns="2">
      <Select label="Prefisso telefonico">
        <SelectOption>+ 39</SelectOption>
        <SelectOption>+ 41</SelectOption>
      </Select>
      <InputPhone label="Telefono" placeholder={faker.phone.phoneNumber()}/>
    </Grid>
    <InputEmail label="E-mail" placeholder={faker.internet.email()}/>
    <Textarea label="Messaggio" placeholder="Scrivi il mesaggio qui..."></Textarea>
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
    <Textarea placeholder="Messaggio"></Textarea>
    <Checkbox>{faker.lorem.sentence()}</Checkbox>
    <Checkbox>{faker.lorem.sentence()}</Checkbox>
    <Checkbox>{faker.lorem.sentence()}</Checkbox>
    <Button>{faker.hacker.verb()}</Button>
  </Grid>

export const horizontalGrid = () =>
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
