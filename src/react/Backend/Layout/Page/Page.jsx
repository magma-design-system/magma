import React from 'react'
import PropTypes from 'prop-types'
import './Page.scss'

import Grid from '@Layout/Grid/Grid'
import H1 from '@Typography/H1/H1'
import H6 from '@Typography/H6/H6'

const PageHeader = props =>
  <header className="backoffice-page__header">
    <H1>{props.children}</H1>
    <H6 className="color-adjust-tone-08">{props.description}</H6>
  </header>

PageHeader.propTypes = {
  description: PropTypes.string,
}

PageHeader.defaultProps = {
  description: 'Crea un nuovo record per questo modello tramite il form sottostante',
}

const Page = props =>
  <Grid className="backoffice-page" gutter="none" template="backoffice">
    <Grid htmlTag="aside" className="backoffice-page__aside">
      <div>[ logo ]</div>
      {props.aside}
      <div>[ footer ]</div>
    </Grid>
    <Grid className="backoffice-page__section" gutter="none" template="backoffice-section">
      { props.header }
      <div className="backoffice-page__content">
        {props.children}
      </div>
    </Grid>
  </Grid>

Page.propTypes = {
  aside: PropTypes.any,
  header: PropTypes.any,
}

Page.defaultProps = {
  aside: '',
}

export default Page
export {
  PageHeader,
}
