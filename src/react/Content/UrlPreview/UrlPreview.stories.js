import React, { Fragment, useState } from 'react'
import faker from 'faker'

import UrlPreview from '@Content/UrlPreview/UrlPreview'
import Paragraph from '@Typography/Paragraph/Paragraph'

faker.locale = 'it'

export default {
  title: 'Content/UrlPreview',
  component: UrlPreview,
}

export const basicUsage = () => {
  const [show, toggleModal] = useState(false)
  const toggle = () => {
    toggleModal(!show)
  }
  return (
    <Fragment>
      <Paragraph>In questo articolo viene citato un famoso articolo di Christian Jensen su <a onClick={() => { toggle() }}>come progettare i Design Principle</a>.</Paragraph>
      <UrlPreview show={show} onClose={() => { toggle() }} url="https://m.calciomercato.com/news/l-inter-e-un-mezzo-disastro-il-problema-non-e-l-assenza-di-lukak-10139"/>
    </Fragment>
  )
}
