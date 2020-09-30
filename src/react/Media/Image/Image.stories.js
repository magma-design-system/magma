import React from 'react'
import faker from 'faker'

import Image from '@Media/Image/Image'

faker.locale = 'it'

export default {
  title: 'Media/Image',
  component: Image,
}

export const defaultUsage = () =>
  <Image src="//via.placeholder.com/700x350" />

export const aspectRatioCinema = () =>
  <Image src="//via.placeholder.com/700x350" aspectRatio="16:9"/>

export const aspectRatioSquare = () =>
  <Image src="//via.placeholder.com/700x350" aspectRatio="1:1"/>

export const imageSource = () =>
  <Image src="//via.placeholder.com/800x600" aspectRatio="4:3" sourceTitle="Illustration by Freepik Stories" sourceUrl="https://stories.freepik.com/"/>

export const imageSourceTitle = () =>
  <Image src="//via.placeholder.com/800x600" aspectRatio="4:3" sourceTitle="Illustration by Freepik Stories"/>

export const imageSourceUrl = () =>
  <Image src="//via.placeholder.com/800x600" aspectRatio="4:3" sourceUrl="https://stories.freepik.com/"/>
