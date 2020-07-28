import React from 'react'
import faker from 'faker'

import TypographyTableGroup from '@System/Design/Typography/TypographyTableGroup'
import Grid from '@Layout/Grid/Grid'
import fontFamilies from '+Tokens/css-tokens/font-families.json'

faker.locale = 'it'

export default {
  title: 'Design/Typography',
  component: TypographyTableGroup,
}

export const Families = () =>
  <Grid>
    {
      Object.entries(fontFamilies).map(([key, value], index) =>
        <TypographyTableGroup group={key} family={value.family} styles={value.styles} />,
      )
    }
  </Grid>
