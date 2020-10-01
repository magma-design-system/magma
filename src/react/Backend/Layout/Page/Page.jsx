import React from 'react'
import PropTypes from 'prop-types'
import faker from 'faker'

import './Page.scss'

import Button from '@Element/Button/Button'
import Caption from '@Typography/Caption/Caption'
import Grid from '@Layout/Grid/Grid'
import H1 from '@Typography/H1/H1'
import H4 from '@Typography/H4/H4'
import H6 from '@Typography/H6/H6'
import Icon from '@Design/Icon/Icon'
import Image from '@Media/Image/Image'

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
  description: '',
}

const PageLogo = props =>
  <header className="backoffice-page-aside-header">
    <Image src={logoMaggioli} className="backoffice-page-aside-header__logo"/>
    <div className="backoffice-page-aside-header__contents">
      <H4 className="backoffice-page-aside-header__title">{props.children}</H4>
      <Caption className="backoffice-page-aside-header__sub-title">DS data entry</Caption>
    </div>
  </header>

const PageFooter = props =>
  <footer className="backoffice-page-aside-footer">
    <div className="backoffice-page-aside-footer__user">
      <Icon name="user" className="backoffice-page-aside-footer__icon"/>
      <Caption className="backoffice-page-aside-footer__email">{props.email}</Caption>
    </div>
    <div className="backoffice-page-aside-footer__actions">
      <Button small={true} className="backoffice-page-aside-footer__action background-color-adjust-tone-06">Gestisci</Button>
      <Button small={true} className="backoffice-page-aside-footer__action background-color-brand-maggioli-06">Esci</Button>
    </div>
  </footer>

PageFooter.propTypes = {
  email: PropTypes.string,
}

PageFooter.defaultProps = {
  email: faker.internet.email(),
}

const Page = props =>
  <Grid className="backoffice-page" gutter="none" template="backoffice">
    <Grid htmlTag="aside" className="backoffice-page__aside" template="backoffice-aside">
      <PageLogo className="backoffice-page__logo">
        {props.title}
      </PageLogo>
      {props.menu}
      {props.footer}
    </Grid>
    <Grid className="backoffice-page__section" gutter="none" template="backoffice-section">
      { props.header }
      <div className="backoffice-page__content">
        {props.children}
      </div>
    </Grid>
  </Grid>

Page.propTypes = {
  header: PropTypes.any,
  menu: PropTypes.any,
  footer: PropTypes.any,
  title: PropTypes.string,
}

Page.defaultProps = {
  title: 'Maggioli',
}

export default Page
export {
  PageHeader,
  PageFooter,
}
