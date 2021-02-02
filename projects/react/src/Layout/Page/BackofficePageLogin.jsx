import React from 'react'
import PropTypes from 'prop-types'
import Caption from '@Typography/Caption/Caption'
import Card from '@Layout/Card/Card'
import Detail from '@Typography/Detail/Detail'
import Grid from '@Layout/Grid/Grid'
import H5 from '@Typography/H5/H5'
import Icon from '@Design/Icon/Icon'
import Row from '@Layout/Row/Row'
import ExternalLink from '@UI/ExternalLink/ExternalLink'
import Banner from '@UI/Banner/Banner'

import './BackofficePageLogin.scss'

const BackofficePageLoginBanner = props => {
  return <Banner className="backoffice-page-login__banner" {...props}><Detail>{props.children}</Detail></Banner>
}

BackofficePageLoginBanner.propTypes = {
  ...Banner.propTypes,
}

const BackofficePageLoginHeader = ({ logo, title, description, ...restProps }) => {
  return <Row gutter="small" {...restProps}>
    <Icon size="xlarge" image={logo}/>
    <div>
      <H5>{title}</H5>
      <Detail>{description}</Detail>
    </div>
  </Row>
}

BackofficePageLoginHeader.propTypes = {
  ...Row.propTypes,
  logo: PropTypes.string,
  title: PropTypes.string,
  description: PropTypes.string,
}

BackofficePageLoginHeader.defaultProps = {
  logo: require('#Identity/gruppo-maggioli/logo-gruppo-maggioli.svg'),
  title: 'Gruppo Maggioli',
  description: 'Accedi al servizio',
}

const BackofficePageLoginBody = ({ children, ...restProps }) => {
  return <Card className="backoffice-page-login__body" boxShadow="box" {...restProps}>
    {children}
  </Card>
}

BackofficePageLoginBody.propTypes = {
  ...Grid.propTypes,
}

const BackofficePageLoginFooter = ({ children, ...restProps }) => {
  return <Grid gutter="small" className="backoffice-page-login__footer">
    <Grid {...restProps} gutter="small">
      {children}
    </Grid>
    <div>
      <Row width="inline">
        <Caption>Servizio sviluppato da</Caption>
        <Icon size="normal" image={require('#Identity/gruppo-maggioli/logo-gruppo-maggioli.svg')}/>
        <ExternalLink href="https://www.maggioli.it"><Caption>Gruppo Maggioli</Caption></ExternalLink>
      </Row>
    </div>
  </Grid>
}

BackofficePageLoginFooter.propTypes = {
  ...Grid.propTypes,
}

const BackofficePageLogin = props => {
  return <div className="backoffice-page-login">
    <Grid className="backoffice-page-login__content">
      {props.children}
    </Grid>
  </div>
}

export default BackofficePageLogin
export {
  BackofficePageLoginBanner,
  BackofficePageLoginBody,
  BackofficePageLoginFooter,
  BackofficePageLoginHeader,
}
