import React from 'react'

import Button from '@UI/Button/Button'
import InputText from '@UI/Input/InputText'
import Header, { HeaderLogo, HeaderMenu } from '@UI/Header/Header'
import Row from '@Layout/Row/Row'
// import logoImage from '@maggioli-design-system/identity/resources/la-polizia-locale/logo-la-polizia-locale-black.svg'

export default {
  title: 'UI/Header',
  component: Header,
}

export const basicUsage = () =>
  <Header lastChild="to-right">
    <HeaderLogo src="http://bibliotecadigitale.maggioli.it/skin/frontend/argentolibreria/argentolibreria/images/logo-biblioteca-digitale.png"/>
    <HeaderMenu>
      <InputText className="overflow-visible" icon="data-search" placeholder="Cerca un volume..."/>
      <Button variant="secondary-outline">Accedi</Button>
      <Button icon="paginator-next">Abbonati</Button>
    </HeaderMenu>
  </Header>

