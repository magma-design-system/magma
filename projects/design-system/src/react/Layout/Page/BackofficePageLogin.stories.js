import React from 'react'
import faker from 'faker'
import Button from '@UI/Button/Button'
import InputEmail from '@UI/Input/InputEmail'
import InputPassword from '@UI/Input/InputPassword'

import BackofficePageLogin, { BackofficePageLoginHeader, BackofficePageLoginBody, BackofficePageLoginFooter } from '@Layout/Page/BackofficePageLogin'

faker.locale = 'it'

export default {
  title: 'Layout/BackofficePageLogin',
  component: BackofficePageLogin,
  decorators: [Story => <div style={{ margin: -15 }}><Story/></div>],
}

export const basicUsage = () =>
  <BackofficePageLogin>
    <BackofficePageLoginBody>
      <BackofficePageLoginHeader logo={require('#Assets/brand/argo/logo-argo-icon.svg')} title="Argo" description="Accedi al servizio"/>
      <InputEmail />
      <InputPassword />
      <Button>Accedi</Button>
    </BackofficePageLoginBody>
    <BackofficePageLoginFooter columns="2">
      <Button size="small" width="inline" variant="secondary-outline">Recupera password</Button>
      <Button size="small" width="inline" variant="secondary">Registrati</Button>
    </BackofficePageLoginFooter>
  </BackofficePageLogin>
