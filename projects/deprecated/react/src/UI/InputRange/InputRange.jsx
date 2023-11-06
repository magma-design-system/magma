import React, { useState } from 'react'
import PropTypes from 'prop-types'
import clsx from 'clsx'
import LabelParagraph from '@Typography/LabelParagraph/LabelParagraph'
import Grid from '@Layout/Grid/Grid'
import Row from '@Layout/Row/Row'
import './InputRange.scss'

const InputRange = ({ className, label, max, min, step, value }) => {

  const [range, setRange] = useState(value)

  return <Grid className="gap-2">
    { label &&
      <Row>
        <LabelParagraph>{ label }</LabelParagraph>
        <LabelParagraph className="ml-auto">{ range }{ max ? ` / ${max}` : ''}</LabelParagraph>
      </Row>
    }
    <input
      className={clsx('range', className)}
      max={max}
      min={min}
      onChange={e => setRange(e.target.value)}
      step={step}
      type="range"
      value={range}
    />
  </Grid>
}

InputRange.propTypes = {
  className: PropTypes.string,
  label: PropTypes.string,
  max: PropTypes.number,
  min: PropTypes.number,
  step: PropTypes.any,
  value: PropTypes.number,
}

InputRange.defaultProps = {
  max: 100,
  min: 1,
  step: 1,
  value: 50,
}

export default InputRange
