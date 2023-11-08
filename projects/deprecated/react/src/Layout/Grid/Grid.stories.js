import React from 'react'
import faker from 'faker'

import Grid from '@Layout/Grid/Grid'
import Hr from '@UI/Hr/Hr'
import Paragraph from '@Typography/Paragraph/Paragraph'
import Banner from '@UI/Banner/Banner'
import InlineCode from '@UI/InlineCode/InlineCode'

import sizes from '@maggioli-design-system/design-tokens/dist/css-tokens/sizes.json'
const sizesList = Object.keys(sizes.size)

faker.locale = 'it'

export default {
  title: 'Layout/Grid',
  component: Grid,
}

const paragraph1 = faker.lorem.paragraph()
const paragraph2 = faker.lorem.paragraph()

export const defaultUsage = () =>
  <Grid>
    <Paragraph>{paragraph1}</Paragraph>
    <Paragraph>{paragraph2}</Paragraph>
  </Grid>

export const gutter = () =>
  <Grid gutter="xlarge">
    {sizesList.map(key => {
      return (
        <Grid key={key} gutter={key}>
          <span>
            <InlineCode>{`${key}`}</InlineCode>
          </span>
          <Paragraph>{faker.lorem.paragraph()}</Paragraph>
          <Paragraph>{faker.lorem.paragraph()}</Paragraph>
        </Grid>
      )
    })}
  </Grid>

export const columns = () =>
  <div>
    {[2, 3, 4].map(key => {
      return (
        <Grid>
          <Grid key={key} columns={key}>
            <span>
              <InlineCode>{`${key}`}</InlineCode>
              <Paragraph>{faker.lorem.paragraph()}</Paragraph>
            </span>
            <Paragraph>{faker.lorem.paragraph()}</Paragraph>
            <Paragraph>{faker.lorem.paragraph()}</Paragraph>
            <Paragraph>{faker.lorem.paragraph()}</Paragraph>
          </Grid>
          <Hr/>
        </Grid>
      )
    })}
  </div>

export const autoFit = () =>
  <Grid template="auto-fit">
    <Paragraph>{faker.lorem.paragraph()}</Paragraph>
    <Paragraph>{faker.lorem.paragraph()}</Paragraph>
    <Paragraph>{faker.lorem.paragraph()}</Paragraph>
    <Paragraph>{faker.lorem.paragraph()}</Paragraph>
    <Paragraph>{faker.lorem.paragraph()}</Paragraph>
  </Grid>

export const autoFill = () =>
  <Grid template="auto-fill">
    <Paragraph>{faker.lorem.paragraph()}</Paragraph>
    <Paragraph>{faker.lorem.paragraph()}</Paragraph>
    <Paragraph>{faker.lorem.paragraph()}</Paragraph>
    <Paragraph>{faker.lorem.paragraph()}</Paragraph>
    <Paragraph>{faker.lorem.paragraph()}</Paragraph>
  </Grid>

export const rows = () =>
  <Grid rows="fit-vertically">
    <Banner>
      Property <InlineCode status="info">rows="fit-vertically"</InlineCode> works nice if you need to distribute elements vertically but with different heights.
    </Banner>
    <Paragraph>{faker.lorem.paragraph()}</Paragraph>
    <Paragraph>{faker.lorem.paragraph()}</Paragraph>
    <Paragraph>{faker.lorem.paragraph()}</Paragraph>
    <Paragraph>{faker.lorem.paragraph()}</Paragraph>
    <Paragraph>{faker.lorem.paragraph()}</Paragraph>
  </Grid>
