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

import InputSearch from '@Form/Input/InputText'

import logoMaggioli from '#Assets/logo/gruppo-maggioli.svg'

const PageHeader = props =>
  <Grid htmlTag="header" className="backoffice-page-content-header" template="content-header">
    <div className="backoffice-page-content-header__info">
      <H1>{props.children}</H1>
      <H6 className="color-adjust-tone-08">{props.description}</H6>
    </div>
    <InputSearch className="backoffice-page-content-header__search" icon="search" placeholder="Cerca..."/>
  </Grid>

PageHeader.propTypes = {
  description: PropTypes.string,
}

PageHeader.defaultProps = {
  description: 'Entità',
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
      <Button onClick={props.onClickManage} small={true} className="backoffice-page-aside-footer__action background-color-adjust-tone-12">Gestisci</Button>
      <Button onClick={props.onClickExit} small={true} className="backoffice-page-aside-footer__action background-color-status-error-12">Esci</Button>
    </div>
  </footer>

PageFooter.propTypes = {
  email: PropTypes.string,
  onClickManage: PropTypes.func,
  onClickExit: PropTypes.func,
}

PageFooter.defaultProps = {
  email: faker.internet.email(),
  onClickManage: () => {},
  onClickExit: () => {},
}

const Page = props => {
  return (
    <Grid className={`backoffice-page ${props.isOpened ? 'backoffice-page--menu-opened' : ''}`} gutter="none" template="backoffice">
      <div className="backoffice-page__close" onClick={props.onClick}>
        <Icon name={props.isOpened ? 'close' : 'menu'}/>
      </div>
      <Grid htmlTag="aside" className="backoffice-page__aside" template="backoffice-aside">
        <PageLogo className="backoffice-page__logo">
          {props.title}
        </PageLogo>
        {props.menu}
        {props.footer}
      </Grid>
      <div className="backoffice-page__section">
        { props.header }
        <div className="backoffice-page__content">
          {props.children}
        </div>
      </div>
    </Grid>
  )
}

Page.propTypes = {
  header: PropTypes.any,
  isOpened: PropTypes.bool,
  menu: PropTypes.any,
  onClick: PropTypes.func,
  footer: PropTypes.any,
  title: PropTypes.string,
}

Page.defaultProps = {
  isOpened: false,
  onClick: () => {},
  title: 'Maggioli',
}

export default Page
export {
  PageHeader,
  PageFooter,
}
