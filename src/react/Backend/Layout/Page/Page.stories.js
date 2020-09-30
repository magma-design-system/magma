import React from 'react'
import faker from 'faker'

import Page, { PageHeader } from '@Backend/Layout/Page/Page'
import InputText from '@Backend/Form/Input/InputText'
import Grid from '@Layout/Grid/Grid'
import Hr from '@Backend/Element/Hr/Hr'
faker.locale = 'it'

export default {
  title: 'Backend/Layout/Page',
  component: Page,
  decorators: [Story => <Story/>],
}

export const basicUsage = () =>
  <Page header={<PageHeader>Libro</PageHeader>}>
    <Grid columns="3">
      <InputText label="Titolo mega lungo da paura" placeholder="Ciaone" icon="shipping" />
      <InputText label="Descrizione" icon="uploadPhoto" filled={true} />
      <InputText label="Descrizione" filled={true} />
      <InputText label="Descrizione" />
    </Grid>
    <Hr/>
  </Page>
