import React from 'react'
import PropTypes from 'prop-types'
import './PackageInfo.scss'

import Card from '@Layout/Card/Card'
import Grid from '@Layout/Grid/Grid'
import Tag from '@UI/Tag/Tag'
import Row from '@Layout/Row/Row'
import Button from '@UI/Button/Button'
import List, { ListItem } from '@UI/List/List'
import Hr from '@UI/Hr/Hr'
import InlineCode from '@UI/InlineCode/InlineCode'
import Paragraph from '@Typography/Paragraph/Paragraph'
import Caption from '@Typography/Caption/Caption'
import H4 from '@Typography/H4/H4'
import H5 from '@Typography/H5/H5'
import Author from '@Content/Author/Author'

const PackageInfo = props =>
  <Card className={`package-info ${props.className}`} {...props} gutter="xsmall">
    <List autoPunctuation={false}>
      <ListItem icon="dev-terminal"><InlineCode>{props.package.name}</InlineCode> <InlineCode>v{props.package.version}</InlineCode></ListItem>
    </List>
    <Paragraph>{props.package.description}</Paragraph>
    <Grid template="package-info-authors">
      { props.package.repository.url && <Button href={props.package.repository.url.replace('.git', '')}>Repository</Button> }
      { props.package.bugs && <Button variant="secondary-outline" href={props.package.bugs.url.replace('.git', '')}>Issue</Button> }
    </Grid>
    <Hr spacing="small" className="background-color-adjust-tone-18"/>
    <Row><H4>Contributors</H4><Tag chip={true} icon="user-team" className="background-color-brand-maggioli-20 color-brand-maggioli-08">{ props.package.contributors.length }</Tag></Row>
    <Grid template="package-info-authors">
      {props.package.contributors.map((item, key) =>
        <Author key={key} gravatar={`${item.email}?s=120&d=mp`}>
          <H5>{item.name}</H5>
          {item.role && <Caption className="color-adjust-tone-08">{item.role}</Caption>}
        </Author>,
      )}
    </Grid>
  </Card>

PackageInfo.propTypes = {
  className: PropTypes.string,
  package: PropTypes.object,
  shadow: PropTypes.string,
}

PackageInfo.defaultProps = {
  className: '',
  shadow: 'box-shadow-soft',
}

export default PackageInfo
