import React from 'react'
import faker from 'faker'
import Author from '@Content/Author/Author'
import Detail from '@Typography/Detail/Detail'
import Caption from '@Typography/Caption/Caption'
import H5 from '@Typography/H5/H5'
import avatarExample from '@Content/Avatar/avatar-example.jpeg'

faker.locale = 'it'

export default {
  title: 'Content/Author',
  component: Author,
}

export const basicUsage = () =>
  <Author src={avatarExample}>
    <H5>Fred Brooks</H5>
    <Detail className="text-adjust-tone-06">Software engineer</Detail>
  </Author>

export const addFields = () =>
  <Author gutter="small" src={avatarExample} size={'large'}>
    <H5>Fred Brooks</H5>
    <Caption className="text-adjust-tone-06">Software engineer</Caption>
    <Caption className="text-adjust-tone-06">fred@brooks.com</Caption>
  </Author>
