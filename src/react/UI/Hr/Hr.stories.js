import React, { Fragment } from 'react'
import faker from 'faker'
import Hr from '@UI/Hr/Hr'
import Detail from '@Typography/Detail/Detail'

import sizes from '+Tokens/css-tokens/sizes.json'
const size = Object.keys(sizes.size)

export default {
  title: 'UI/Hr',
  component: Hr,
}

export const basicUsage = () =>
  <Hr/>

export const verticalSpacing = () =>
  size.map(key => {
    return <div key={key} className="background-color-brand-maggioli-15">
      <Detail className="background-color-adjust-tone">{faker.lorem.paragraph()}</Detail>
      <Hr spacing={key} className="background-color-brand-maggioli-10"/>
      <Detail className="background-color-adjust-tone">{faker.lorem.paragraph()}</Detail>
    </div>
  })
