import React from 'react'
import faker from 'faker'

import InputEmail from '@UI/Input/InputEmail'
import InputList, { InputListItem } from '@UI/Input/InputList'
import InputPassword from '@UI/Input/InputPassword'
import InputPhone from '@UI/Input/InputPhone'
import Banner from '@UI/Banner/Banner'
import InlineCode from '@UI/InlineCode/InlineCode'
import Grid from '@Layout/Grid/Grid'
import InputText from '@UI/Input/InputText'
import randomIcon from '@Design/Icon/faker'
faker.locale = 'it'

export default {
  title: 'UI/InputText',
  component: InputText,
}

export const basicUsage = () =>
  <InputText label={faker.lorem.sentence()} placeholder={faker.company.catchPhrase()}/>

export const fill = () =>
  <Grid>
    <Banner status="info">
      Serve a dare <InlineCode status="info">width: 100%</InlineCode> al componente, altrimenti non riempirà la riga in cui si trova a meno che non sia gestito dal componente <InlineCode status="info">Grid</InlineCode>.
    </Banner>
    <InputText placeholder={faker.company.catchPhrase()} fill/>
  </Grid>

export const grow = () =>
  <Grid>
    <Banner status="info">
      Serve a dare <InlineCode status="info">flex-grow: 1</InlineCode> è utile in concomitanza di flex wrapper come il componente <InlineCode status="info">Row</InlineCode>.
    </Banner>
    <InputText placeholder={faker.company.catchPhrase()} grow/>
  </Grid>

export const noLabel = () =>
  <InputText placeholder={faker.company.catchPhrase()}/>

export const customIcon = () =>
  <InputText placeholder="Inserisci qualcosa a caso..." icon={randomIcon()}/>

export const Phone = () =>
  <InputPhone label="This is a text field" placeholder={faker.company.catchPhrase()}/>

export const Password = () =>
  <InputPassword label="This is a text field" placeholder={faker.company.catchPhrase()}/>

export const Email = () =>
  <InputEmail label={faker.lorem.sentence()} placeholder={faker.internet.exampleEmail()}/>

const cities = new Array(50)
  .fill(null)
  .map(() =>
    faker.address.city(),
  ).sort()

export const List = () =>
  <InputList label="Città" placeholder="Inerisci il nome di una città...">
    {cities.map((city, index) =>
      <InputListItem key={index} value={city}/>,
    )}
  </InputList>

export const Error = () =>
  <InputText label={faker.lorem.sentence()} placeholder={faker.company.catchPhrase()} icon={randomIcon()} error={faker.lorem.sentence()}/>

export const autoFocus = () =>
  <InputText label={faker.lorem.sentence()} placeholder={faker.company.catchPhrase()} icon={randomIcon()} autoFocus/>
