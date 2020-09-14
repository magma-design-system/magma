import React from 'react'
import faker from 'faker'

import Picture from '@Element/Picture/Picture'
import Grid from '@Layout/Grid/Grid'
import Paragraph from '@Typography/Paragraph/Paragraph'

faker.locale = 'it'

export default {
  title: 'Element/Picture',
  component: Picture,
}

const explanation = 'The media query rules sources should be ordered from the bigger image to the lower one to let it works properly.'

export const defaultUsage = () =>
  <Grid>
    <Paragraph>{ explanation }</Paragraph>
    <Picture sources={[
      { media: '(min-width: 800px)', srcset: '//via.placeholder.com/1600x800' },
      { media: '(min-width: 600px)', srcset: '//via.placeholder.com/1200x600' },
      { media: '(max-width: 599px)', srcset: '//via.placeholder.com/800x400' },
    ]} />
  </Grid>

export const AspectRatioTV = () =>
  <Grid>
    <Paragraph>{ explanation }</Paragraph>
    <Picture aspectRatio="4:3" sources={[
      { media: '(min-width: 800px)', srcset: '//via.placeholder.com/1600x800' },
      { media: '(min-width: 600px)', srcset: '//via.placeholder.com/1200x600' },
      { media: '(max-width: 599px)', srcset: '//via.placeholder.com/800x400' },
    ]} />
  </Grid>

export const AspectRatioCinema = () =>
  <Grid>
    <Paragraph>{ explanation }</Paragraph>
    <Picture aspectRatio="16:9" sources={[
      { media: '(min-width: 800px)', srcset: '//via.placeholder.com/1600x800' },
      { media: '(min-width: 600px)', srcset: '//via.placeholder.com/1200x600' },
      { media: '(max-width: 599px)', srcset: '//via.placeholder.com/800x400' },
    ]} />
  </Grid>
