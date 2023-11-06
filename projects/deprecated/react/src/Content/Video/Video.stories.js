import React from 'react'
import Video from '@Content/Video/Video'
import Grid from '@Layout/Grid/Grid'
import video01 from './preview-01.mp4'
import video02 from './preview-02.mp4'

export default {
  title: 'Content/Video',
  component: Video,
}

const overlays = [
  'none',
  'classic',
  'sharp',
  'soft',
  'tv',
]

export const basicUsage = () =>
  <Video autoPlay loop>
    <source src={video01} type="video/mp4"/>
  </Video>

export const overlay = () =>
  <Grid>
    {overlays.map(key =>
      <Video autoPlay loop key={key} overlay={key}>
        <source src={video02} type="video/mp4"/>
      </Video>,
    )}
  </Grid>

export const overlayColor = () =>
  <Grid>
    <Video autoPlay loop overlay="classic" overlayClassName="bg-brand-maggioli-06 bg-opacity-80">
      <source src={video02} type="video/mp4"/>
    </Video>
  </Grid>
