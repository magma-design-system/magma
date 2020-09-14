import React from 'react'
import faker from 'faker'

import Image from '@Element/Image/Image'

faker.locale = 'it'

export default {
  title: 'Element/Image',
  component: Image,
}

export const defaultUsage = () =>
  <Image src="//via.placeholder.com/700x350" />

export const aspectRatioCinema = () =>
  <Image src="//via.placeholder.com/700x350" aspectRatio="16:9"/>

export const aspectRatioSquare = () =>
  <Image src="//via.placeholder.com/700x350" aspectRatio="1:1"/>
