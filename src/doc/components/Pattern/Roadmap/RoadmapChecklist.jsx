import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import Grid from '@Layout/Grid/Grid'
import H2 from '@Typography/H2/H2'
import Paragraph from '@Typography/Paragraph/Paragraph'
// import Icon from '@Design/Icon/Icon'

const RoadmapChecklist = props =>
  <Grid className={`ds-accessibility-test ${props.className}`}>
    { props.checklist.map(element => {
      return <Fragment>
        <H2>{ element.title }</H2>
        <Paragraph>{ element.description }</Paragraph>
      </Fragment>
    })}
  </Grid>

RoadmapChecklist.propTypes = {
  className: PropTypes.string,
  checklist: PropTypes.any,
}

RoadmapChecklist.defaultProps = {
  className: '',
}

export default RoadmapChecklist
