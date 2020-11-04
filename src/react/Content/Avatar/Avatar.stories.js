import React, { Fragment } from 'react'
import faker from 'faker'

import Avatar from '@Content/Avatar/Avatar'
import Grid from '@Layout/Grid/Grid'
import InlineCode from '@UI/InlineCode/InlineCode'
import sizesData from '+Tokens/css-tokens/sizes.json'

const avatarSizes = Object.keys(sizesData.avatar)

faker.locale = 'it'

export default {
  title: 'Content/Avatar',
  component: Avatar,
}

export const basicUsage = () =>
  <Avatar url={require('./avatar-example.jpeg')}/>

export const sizes = () =>
  <Grid gutter="xlarge" columns="2">
    {avatarSizes.map(key =>
      <Fragment>
        <Avatar key={key} size={key} url={require('./avatar-example.jpeg')}/>
        <InlineCode>{`${key}`}</InlineCode>
      </Fragment>,

    )}
  </Grid>
