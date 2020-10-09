import React from 'react'
import PropTypes from 'prop-types'
import faker from 'faker'

import HorizontalScroll from '@Layout/HorizontalScroll/HorizontalScroll'
import Grid from '@Layout/Grid/Grid'
import Button from '@Form/Button/Button'
import Paragraph from '@Typography/Paragraph/Paragraph'

import './HorizontalScroll.stories.scss'

faker.locale = 'it'

const WideElement = props =>
  <div className={`wide-element ${props.className}`}></div>

WideElement.propTypes = {
  className: PropTypes.string,
}

WideElement.defaultProps = {
  className: '',
}

export default {
  title: 'Layout/HorizontalScroll',
  component: HorizontalScroll,
}

export const defaultUse = () =>
  <HorizontalScroll>
    <WideElement/>
    <WideElement/>
    <WideElement/>
    <WideElement/>
    <WideElement/>
  </HorizontalScroll>

export const innerMargin = () =>
  <HorizontalScroll innerMargin>
    <WideElement/>
    <WideElement/>
    <WideElement/>
    <WideElement/>
    <WideElement/>
  </HorizontalScroll>

export const outerMargin = () =>
  <HorizontalScroll outerMargin innerMargin>
    <WideElement/>
    <WideElement/>
    <WideElement/>
    <WideElement/>
    <WideElement/>
  </HorizontalScroll>

export const smooth = () =>
  <Grid>
    <Paragraph>This is native scroll snapping, nice on ios e android, works properly with wide elements</Paragraph>
    <HorizontalScroll smooth innerMargin>
      <WideElement />
      <WideElement />
      <WideElement />
      <WideElement />
      <WideElement />
      <WideElement />
    </HorizontalScroll>
  </Grid>
