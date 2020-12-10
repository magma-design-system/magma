import React from 'react'
import faker from 'faker'
import Button from '@UI/Button/Button'
import InputEmail from '@UI/Input/InputEmail'
import InputPassword from '@UI/Input/InputPassword'
import Detail from '@Typography/Detail/Detail'

import BackofficePageLogin, { BackofficePageLoginBanner, BackofficePageLoginHeader, BackofficePageLoginBody, BackofficePageLoginFooter } from '@Layout/Page/BackofficePageLogin'

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
      <Button size="small" variant="secondary-outline">Recupera password</Button>
      <Button size="small" variant="secondary">Registrati</Button>
    </BackofficePageLoginFooter>
  </BackofficePageLogin>

export const register = () =>
  <BackofficePageLogin>
    <BackofficePageLoginBody>
      <BackofficePageLoginHeader logo={require('#Assets/brand/argo/logo-argo-icon.svg')} title="Argo" description="Registrati al servizio"/>
      <InputEmail />
      <InputPassword />
      <InputPassword placeholder="ripeti password" />
      <Button>Registrati</Button>
    </BackofficePageLoginBody>
    <BackofficePageLoginFooter columns="2">
      <Button size="small" variant="secondary-outline">Recupera password</Button>
      <Button size="small" variant="secondary">Accedi</Button>
    </BackofficePageLoginFooter>
  </BackofficePageLogin>

export const registerFeedback = () =>
  <BackofficePageLogin>
    <BackofficePageLoginBody>
      <BackofficePageLoginHeader logo={require('#Assets/brand/argo/logo-argo-icon.svg')} title="Argo" description="Registrati al servizio"/>
      <BackofficePageLoginBanner status="success">Utente registrato con successo.</BackofficePageLoginBanner>
      <Detail>Tra poco riceverai una <b>e-mail</b> per attivare il tuo account e poter accedere al servizio.</Detail>
      <Button>Accedi</Button>
    </BackofficePageLoginBody>
    <BackofficePageLoginFooter>
      <Button size="small" variant="secondary-outline">Recupera password</Button>
    </BackofficePageLoginFooter>
  </BackofficePageLogin>

export const passwordRecover = () =>
  <BackofficePageLogin>
    <BackofficePageLoginBody>
      <BackofficePageLoginHeader logo={require('#Assets/brand/argo/logo-argo-icon.svg')} title="Argo" description="Recupero password"/>
      <InputEmail/>
      <Button>Invia e-mail di recupero</Button>
    </BackofficePageLoginBody>
    <BackofficePageLoginFooter columns="2">
      <Button size="small" variant="secondary">Registrati</Button>
      <Button size="small" variant="secondary">Accedi</Button>
    </BackofficePageLoginFooter>
  </BackofficePageLogin>

export const passwordRecoverFeedback = () =>
  <BackofficePageLogin>
    <BackofficePageLoginBody>
      <BackofficePageLoginHeader logo={require('#Assets/brand/argo/logo-argo-icon.svg')} title="Argo" description="Recupero password"/>
      <BackofficePageLoginBanner status="success">Email di recupero inviata correttamente.</BackofficePageLoginBanner>
      <Detail>Tra poco riceverai una <b>e-mail</b> con i dettagli per reimpostare la password.</Detail>
    </BackofficePageLoginBody>
    <BackofficePageLoginFooter columns="2">
      <Button size="small" variant="secondary">Accedi</Button>
      <Button size="small" variant="secondary">Registrati</Button>
    </BackofficePageLoginFooter>
  </BackofficePageLogin>

export const passwordRecoverChange = () =>
  <BackofficePageLogin>
    <BackofficePageLoginBody>
      <BackofficePageLoginHeader logo={require('#Assets/brand/argo/logo-argo-icon.svg')} title="Argo" description="Recupero password"/>
      <Detail>Imposta una nuova password per l'account <b>nome.cognome@maggioli.it</b>. Una volta impostata, potrai nuovamente accedere.</Detail>
      <InputPassword />
      <InputPassword placeholder="ripeti password" />
      <Button>Imposta password</Button>
    </BackofficePageLoginBody>
    <BackofficePageLoginFooter columns="2">
      <Button size="small" variant="secondary">Registrati</Button>
      <Button size="small" variant="secondary">Accedi</Button>
    </BackofficePageLoginFooter>
  </BackofficePageLogin>

export const passwordRecoverChangeFeedback = () =>
  <BackofficePageLogin>
    <BackofficePageLoginBody>
      <BackofficePageLoginHeader logo={require('#Assets/brand/argo/logo-argo-icon.svg')} title="Argo" description="Recupero password"/>
      <Detail>Grazie per la tua pazienza, segnati la password in un Wallet criptato in modo da metterla in un posto sicuro.</Detail>
      <Detail>Ora potrai accedere nuovamente.</Detail>
      <Button>Accedi</Button>
    </BackofficePageLoginBody>
    <BackofficePageLoginFooter>
      <Button size="small" variant="secondary">Registrati</Button>
    </BackofficePageLoginFooter>
  </BackofficePageLogin>
