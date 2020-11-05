import React from 'react'
import PropTypes from 'prop-types'

import './BackofficePage.scss'

import Button from '@UI/Button/Button'
import Caption from '@Typography/Caption/Caption'
import Grid from '@Layout/Grid/Grid'
import Row from '@Layout/Row/Row'
import H1 from '@Typography/H1/H1'
import H4 from '@Typography/H4/H4'
import H6 from '@Typography/H6/H6'
import Icon from '@Design/Icon/Icon'
import Image from '@Content/Image/Image'

const logoMaggioli = require('#Assets/logo/gruppo-maggioli.svg')

const BackofficePageAside = props =>
  <Grid htmlTag="aside" className="backoffice-page__aside" template="backoffice-aside">
    <header className="backoffice-page-aside-header">
      {props.logo && <Image src={logoMaggioli} className="backoffice-page-aside-header__logo"/> }
      <div className="backoffice-page-aside-header__contents">
        <H4 className="backoffice-page-aside-header__title">{props.title}</H4>
        {props.description && <Caption className="backoffice-page-aside-header__sub-title">{props.description}</Caption> }
      </div>
    </header>
    {props.children}
  </Grid>

BackofficePageAside.propTypes = {
  logo: PropTypes.bool,
  title: PropTypes.string,
  description: PropTypes.string,
}

BackofficePageAside.defaultProps = {
  logo: true,
  title: 'Backoffice',
  description: 'Gruppo Maggioli',
}

const BackofficePageAsideFooter = props =>
  <footer className="backoffice-page-aside-footer">
    <div className="backoffice-page-aside-footer__user">
      <Icon name="user" className="backoffice-page-aside-footer__icon"/>
      <Caption className="backoffice-page-aside-footer__email">{props.email}</Caption>
    </div>
    <Row className="backoffice-page-aside-footer__actions" gutter="xsmall">
      <Button onClick={props.onClickManage} small={true} className="backoffice-page-aside-footer__action background-color-adjust-tone-12">Gestisci</Button>
      <Button onClick={props.onClickExit} small={true} className="backoffice-page-aside-footer__action background-color-status-error-12">Esci</Button>
    </Row>
  </footer>

BackofficePageAsideFooter.propTypes = {
  email: PropTypes.string,
  onClickManage: PropTypes.func,
  onClickExit: PropTypes.func,
}

BackofficePageAsideFooter.defaultProps = {
  email: 'email@email.com',
  onClickManage: () => {},
  onClickExit: () => {},
}

const BackofficePageSectionHeader = props =>
  <Grid htmlTag="header" className="backoffice-page-content-header" template="content-header">
    <div className="backoffice-page-content-header__info">
      <H1>{props.title}</H1>
      <H6 className="color-adjust-tone-08">{props.description}</H6>
    </div>
    {props.children && <div className="backoffice-page-content-header__search">
      {props.children}
    </div>}
  </Grid>

BackofficePageSectionHeader.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  onChange: PropTypes.func,
  value: PropTypes.string,
  visible: PropTypes.bool,
}

BackofficePageSectionHeader.defaultProps = {
  title: 'Modello',
  description: 'Description',
  onChange: () => {},
  value: '',
  visible: true,
}

const BackofficePageSection = props =>
  <div className="backoffice-page__section">
    {props.children}
  </div>

const BackofficePageContent = props =>
  <div className="backoffice-page__content">
    {props.children}
  </div>

const BackofficePage = props =>
  <Grid className={`backoffice-page ${props.isOpened ? 'backoffice-page--menu-opened' : ''}`} gutter="none" template="backoffice">
    <div className="backoffice-page__close" onClick={props.onClick}>
      <Icon name={props.isOpened ? 'action-close' : 'menu-main'}/>
    </div>
    {props.children}
  </Grid>

BackofficePage.propTypes = {
  header: PropTypes.any,
  isOpened: PropTypes.bool,
  menu: PropTypes.any,
  onClick: PropTypes.func,
  footer: PropTypes.any,
  title: PropTypes.string,
}

BackofficePage.defaultProps = {
  isOpened: false,
  onClick: () => {},
  title: 'Maggioli',
}

export default BackofficePage
export {
  BackofficePageAside,
  BackofficePageAsideFooter,
  BackofficePageContent,
  BackofficePageSection,
  BackofficePageSectionHeader,
}
