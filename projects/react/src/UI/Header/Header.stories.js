import React from 'react'

import Header from '@UI/Header/Header'
import Button from '@UI/Button/Button'
import Image from '@Content/Image/Image'
// import logoImage from '@maggioli-design-system/identity/resources/la-polizia-locale/logo-la-polizia-locale-black.svg'

export default {
  title: 'UI/Header',
  component: Header,
}

export const basicUsage = () =>
  <Header>
    <Image src="https://avatars3.githubusercontent.com/u/26166261?s=400"/>
    <Button>Hello</Button>
  </Header>
