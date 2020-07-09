import React, { useState } from 'react'
import PropTypes from 'prop-types'
import './AccessibilitySelector.scss'

import Icon from '@Design/Icon/Icon'
import Select, { SelectOption } from '@Form/Select/Select'
import Grid from '@Layout/Grid/Grid'
import Row from '@Layout/Row/Row'
import H5 from '@Typography/H5/H5'
import H3 from '@Typography/H3/H3'
import Paragraph from '@Typography/Paragraph/Paragraph'
import Caption from '@Typography/Caption/Caption'

const AccessibilitySelector = props => {
  const initBackgroundState = {
    hex: 'd0e8fe',
    name: 'Brand Maggioli C-14',
    selector: 'background-color-brand-maggioli-14',
  }

  const initTextState = {
    hex: 'd0e8fe',
    name: 'Brand Maggioli C-14',
    selector: 'color-brand-maggioli-04',
  }

  const [backgroundState, setBackgroundState] = useState(initBackgroundState)
  const [textState, setTextState] = useState(initTextState)

  console.log(backgroundState)

  return (
    <Grid className="mds-accessibility-selector">
      <Grid columns="2" className="mds-accessibility-selector">
        <Grid gutter="xsmall">
          <Row>
            <Icon name="background"/>
            <H5>Sfondo</H5>
          </Row>
          <Select onChange={e => setBackgroundState(e.target.value)} value={backgroundState}>
            {
              Object.entries(props.token).map(([code, color], key) =>
                <SelectOption
                  key={key}
                  value={{ selector: `background-color-brand-maggioli-${code.replace('c-', '')}`, hex: color, name: `Brand Maggioli ${code}` }}
                >Brand Maggioli {code}</SelectOption>
                ,
              )
            }
          </Select>
        </Grid>
        <Grid gutter="xsmall">
          <Row>
            <Icon name="text"/>
            <H5>Testo</H5>
          </Row>
          <Select onChange={e => setTextState(e.target.value)} value={textState}>
            {
              Object.entries(props.token).map(([code, color], key) =>
                <SelectOption
                  key={key}
                  value={{ selector: `background-color-brand-maggioli-${code}`, hex: color, name: `Brand Maggioli ${code}` }}
                >Brand Maggioli {code}</SelectOption>
                ,
              )
            }
          </Select>
        </Grid>
      </Grid>
      <Grid gutter="large" className={`mds-accessibility-selector__background ${backgroundState.selector}`}>
        <H3 className={`${textState.selector}`}/>
        <H5 className={`${textState.selector}`}/>
        <Paragraph className={`${textState.selector}`}/>
        <Caption className={`${textState.selector}`}/>
      </Grid>
    </Grid>
  )
}

AccessibilitySelector.propTypes = {
  token: PropTypes.obj,
}

AccessibilitySelector.defaultProps = {
  token: {},
}

export default AccessibilitySelector
