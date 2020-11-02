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
      <UrlPreview show={show} onClose={() => { toggle() }} url="https://polaris.shopify.com/"/>
    </Fragment>
  )
}

export const pipp = () => {
  const [show, toggleModal] = useState(false)
  const toggle = () => {
    toggleModal(!show)
  }
  return (
    <Fragment>
      <Paragraph>In questo articolo viene citato un famoso articolo di Christian Jensen su <a onClick={() => { toggle() }}>come progettare i Design Principle</a>.</Paragraph>
      <UrlPreview show={show} onClose={() => { toggle() }} url="https://stories.freepik.com/search"/>
    </Fragment>
  )
}

export const headers = () => {
  const [show, toggleModal] = useState(false)
  const toggle = () => {
    toggleModal(!show)
  }
  return (
    <Fragment>
      <Paragraph>In questo articolo viene citato un famoso articolo di Christian Jensen su <a onClick={() => { toggle() }}>come progettare i Design Principle</a>.</Paragraph>
      <UrlPreview show={show} onClose={() => { toggle() }} url="https://uxdesign.cc/the-cognitive-overload-happening-on-your-screen-right-now-deee2a913393"/>
    </Fragment>
  )
}
