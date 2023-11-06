import React from 'react'
import faker from 'faker'

import Form from '@Layout/Form/Form'
import Grid from '@Layout/Grid/Grid'
import InputText from '@UI/Input/InputText'
import InputPassword from '@UI/Input/InputPassword'
import Button from '@UI/Button/Button'
import Banner from '@UI/Banner/Banner'
import InlineCode from '@UI/InlineCode/InlineCode'

faker.locale = 'it'

export default {
  title: 'Layout/Form',
  component: Form,
}

export const defaultUsage = () =>
  <Grid>
    <Banner>Il componente <InlineCode className="bg-status-info-16 text-status-info-05">Form</InlineCode> eredita i comportamenti di layout da <InlineCode className="bg-status-info-16 text-status-info-05">Grid</InlineCode>.</Banner>
    <Form columns="3">
      <InputText icon="user" placeholder="Username" />
      <InputPassword placeholder="Password" />
      <Button icon="crud-save">Login</Button>
    </Form>
  </Grid>
