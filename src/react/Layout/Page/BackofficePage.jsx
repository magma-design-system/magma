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

import InputSearch from '@UI/Input/InputText'

import logoMaggioli from '#Assets/logo/gruppo-maggioli.svg'

const BackofficePageHeader = props =>
  <Grid htmlTag="header" className="backoffice-page-content-header" template="content-header">
    <div className="backoffice-page-content-header__info">
      <H1>{props.children}</H1>
      <H6 className="color-adjust-tone-08">{props.description}</H6>
    </div>
    {props.visible
      ? <InputSearch onChange={props.onChange} className="backoffice-page-content-header__search" icon="data-search" placeholder="Cerca..." value={props.value}/> : ''}
  </Grid>

BackofficePageHeader.propTypes = {
  description: PropTypes.string,
  onChange: PropTypes.func,
  value: PropTypes.string,
  visible: PropTypes.bool,
}

BackofficePageHeader.defaultProps = {
  description: 'Entità',
  onChange: () => {},
  value: '',
  visible: true,
}

const BackofficePageLogo = props =>
  <header className="backoffice-page-aside-header">
    <Image src={logoMaggioli} className="backoffice-page-aside-header__logo"/>
    <div className="backoffice-page-aside-header__contents">
      <H4 className="backoffice-page-aside-header__title">{props.children}</H4>
      <Caption className="backoffice-page-aside-header__sub-title">Gruppo Maggioli</Caption>
    </div>
  </header>

const BackofficePageFooter = props =>
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

BackofficePageFooter.propTypes = {
  email: PropTypes.string,
  onClickManage: PropTypes.func,
  onClickExit: PropTypes.func,
}

BackofficePageFooter.defaultProps = {
  email: 'email@email.com',
  onClickManage: () => {},
  onClickExit: () => {},
}

const BackofficePage = props => {
  // const [isOpened, onClick] = useState(false)
  return (
    <Grid className={`backoffice-page ${props.isOpened ? 'backoffice-page--menu-opened' : ''}`} gutter="none" template="backoffice">
      <div className="backoffice-page__close" onClick={props.onClick}>
        <Icon name={props.isOpened ? 'action-close' : 'menu-main'}/>
      </div>
      <Grid htmlTag="aside" className="backoffice-page__aside" template="backoffice-aside">
        <BackofficePageLogo className="backoffice-page__logo">
          {props.title}
        </BackofficePageLogo>
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
  BackofficePageHeader,
  BackofficePageFooter,
}
