import React from 'react'
import PropTypes from 'prop-types'
import faker from 'faker'

import HorizontalScroll from '@Layout/HorizontalScroll/HorizontalScroll'
import Grid from '@Layout/Grid/Grid'
import Banner from '@UI/Banner/Banner'
import InlineCode from '@UI/InlineCode/InlineCode'

import './HorizontalScroll.stories.scss'

import sizes from '@maggioli-design-system/design-tokens/dist/css-tokens/sizes.json'
const sizesList = Object.keys(sizes.size)

faker.locale = 'it'

const WideElement = props =>
  <div className={`wide-element text-mono text-mono--code ${props.className}`}>{props.children}</div>

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

export const defaultUsage = () =>
  <HorizontalScroll>
    <WideElement/>
    <WideElement/>
    <WideElement/>
    <WideElement/>
    <WideElement/>
  </HorizontalScroll>

export const innerMargin = () =>
  <Grid>
    <Banner status="info">La proprietà <InlineCode status="info">innerMargin</InlineCode> definisce la distanza che separa gli all'interno del componente</Banner>
    {sizesList.map(key =>
      <HorizontalScroll key={key} innerMargin={key} className="background-color-adjust-tone-19">
        <WideElement>{key}</WideElement>
        <WideElement>{key}</WideElement>
        <WideElement>{key}</WideElement>
        <WideElement>{key}</WideElement>
        <WideElement>{key}</WideElement>
      </HorizontalScroll>,
    )}
  </Grid>

export const outerMargin = () =>
  <Grid>
    <Banner status="info">La proprietà <InlineCode status="info">outerMargin</InlineCode> definisce la distanza laterale tra gli item cotenuti e il componente.</Banner>
    {sizesList.map(key =>
      <HorizontalScroll key={key} outerMargin={key} className="background-color-adjust-tone-19">
        <WideElement>{key}</WideElement>
        <WideElement>{key}</WideElement>
        <WideElement>{key}</WideElement>
        <WideElement>{key}</WideElement>
        <WideElement>{key}</WideElement>
      </HorizontalScroll>,
    )}
  </Grid>

export const smooth = () =>
  <Grid>
    <Banner status="info">This is native scroll snapping, nice on ios e android, works properly with wide elements.</Banner>
    <HorizontalScroll smooth outerMargin="small" innerMargin="small" className="background-color-adjust-tone-19">
      <WideElement />
      <WideElement />
      <WideElement />
      <WideElement />
      <WideElement />
      <WideElement />
    </HorizontalScroll>
  </Grid>
