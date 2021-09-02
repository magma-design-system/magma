import React, { Fragment, useState } from 'react'

import Button from '@UI/Button/Button'
import Modal from '@UI/Modal/Modal'
import InputText from '@UI/Input/InputText'
import Header, { HeaderLogo, HeaderMenu } from '@UI/Header/Header'
import Row from '@Layout/Row/Row'
// import logoImage from '@maggioli-design-system/identity/resources/la-polizia-locale/logo-la-polizia-locale-black.svg'

export default {
  title: 'UI/Header',
  component: Header,
}

export const basicUsage = () => {
  const [ visible, setVisible ] = useState(false);
  return <Fragment>
    <Header lastChild="to-right">
      <HeaderLogo src="//via.placeholder.com/350x150"/>
      <HeaderMenu onClick={() => setVisible(!visible)}>
        <InputText className="overflow-visible" icon="data-search" placeholder="Cerca un volume..."/>
        <Button variant="secondary-outline">Accedi</Button>
        <Button icon="paginator-next" iconPosition="right" variant="success">Abbonati</Button>
      </HeaderMenu>
    </Header>
    <Modal visible={visible} onCancel={() => setVisible(false)} position="left" footer={false} contentOnly={true}>
      <InputText className="overflow-visible" icon="data-search" placeholder="Cerca un volume..."/>
      <Button variant="secondary-outline">Accedi</Button>
      <Button icon="paginator-next">Abbonati</Button>
    </Modal>
  </Fragment>
}

export const headline = () => {
  const [ visible, setVisible ] = useState(false)
  return <Fragment>
    <Header lastChild="to-right">
      <HeaderLogo headline="di Maggioli Editore" src="//via.placeholder.com/350x150"/>
      <HeaderMenu onClick={() => setVisible(!visible)}>
        <InputText className="overflow-visible" icon="data-search" placeholder="Cerca un volume..."/>
        <Button variant="secondary-outline">Accedi</Button>
        <Button icon="paginator-next" iconPosition="right" variant="success">Abbonati</Button>
      </HeaderMenu>
    </Header>
    <Modal visible={visible} onCancel={() => setVisible(false)} position="left" footer={false} contentOnly={true}>
      <InputText className="overflow-visible" icon="data-search" placeholder="Cerca un volume..."/>
      <Button variant="secondary-outline">Accedi</Button>
      <Button icon="paginator-next">Abbonati</Button>
    </Modal>
  </Fragment>
}

