import React from 'react'
import PropTypes from 'prop-types'
import './Page.scss'

import Grid from '@Layout/Grid/Grid'
import H1 from '@Typography/H1/H1'
import H4 from '@Typography/H4/H4'
import H6 from '@Typography/H6/H6'
import Caption from '@Typography/Caption/Caption'
import Image from '@Media/Image/Image'

import Menu from '@Backend/Element/Menu/Menu'

import logoMaggioli from '#Assets/logo/gruppo-maggioli.svg'

const PageHeader = props =>
  <header className="backoffice-page__content-header">
    <H1>{props.children}</H1>
    <H6 className="color-adjust-tone-08">{props.description}</H6>
  </header>

PageHeader.propTypes = {
  description: PropTypes.string,
}

PageHeader.defaultProps = {
  description: 'Crea un nuovo record per questo modello tramite il form sottostante',
}

const PageLogo = () =>
  <div className="backoffice-page-aside-header">
    <Image src={logoMaggioli} className="backoffice-page-aside-header__logo"/>
    <div className="backoffice-page-aside-header__contents">
      <H4 className="backoffice-page-aside-header__title">Maggioli</H4>
      <Caption className="backoffice-page-aside-header__sub-title">Data entry tool</Caption>
    </div>
  </div>

const Page = props =>
  <Grid className="backoffice-page" gutter="none" template="backoffice">
    <Grid htmlTag="aside" className="backoffice-page__aside" template="backoffice-aside">
      <PageLogo className="backoffice-page__logo"/>
      <Menu/>
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
