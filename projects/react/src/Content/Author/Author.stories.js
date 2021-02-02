import React from 'react'
import faker from 'faker'
import Author from '@Content/Author/Author'
import Detail from '@Typography/Detail/Detail'
import Caption from '@Typography/Caption/Caption'
import H5 from '@Typography/H5/H5'

faker.locale = 'it'

export default {
  title: 'Content/Author',
  component: Author,
}

export const basicUsage = () =>
  <Author avatar={require('@Content/Avatar/avatar-example.jpeg')}>
    <H5>Fred Brooks</H5>
    <Detail className="color-adjust-tone-06">Software engineer</Detail>
  </Author>

export const addFields = () =>
  <Author gutter="small" avatar={require('@Content/Avatar/avatar-example.jpeg')} size={'large'}>
    <H5>Fred Brooks</H5>
    <Caption className="color-adjust-tone-06">Software engineer</Caption>
    <Caption className="color-adjust-tone-06">fred@brooks.com</Caption>
  </Author>
