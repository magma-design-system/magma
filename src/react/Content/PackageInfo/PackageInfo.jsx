import React from 'react'
import PropTypes from 'prop-types'
import './PackageInfo.scss'

import Card from '@Layout/Card/Card'
import List, { ListItem } from '@UI/List/List'
import Hr from '@UI/Hr/Hr'
import InlineCode from '@UI/InlineCode/InlineCode'
// import Icon from '@Design/Icon/Icon'

const PackageInfo = props =>
  <Card className={`package-info ${props.className}`} gutter="none">
    <List autoPunctuation={false}>
      <ListItem>Nome <InlineCode>{props.package.name}</InlineCode></ListItem>
      <ListItem>Versione <InlineCode>{props.package.version}</InlineCode></ListItem>
    </List>
    <Hr/>
  </Card>

PackageInfo.propTypes = {
  className: PropTypes.string,
  package: PropTypes.object,
}

PackageInfo.defaultProps = {
  className: '',
}

export default PackageInfo
