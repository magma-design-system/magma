import React from 'react'
import PropTypes from 'prop-types'
import './PackageInfo.scss'

import { styles } from '@Library/styles'

import Card from '@Layout/Card/Card'
import Grid from '@Layout/Grid/Grid'
import Tag from '@UI/Tag/Tag'
import Row from '@Layout/Row/Row'
import Button from '@UI/Button/Button'
import UList, { UListItem } from '@UI/UList/UList'
import Hr from '@UI/Hr/Hr'
import InlineCode from '@UI/InlineCode/InlineCode'
import Paragraph from '@Typography/Paragraph/Paragraph'
import Caption from '@Typography/Caption/Caption'
import H4 from '@Typography/H4/H4'
import H5 from '@Typography/H5/H5'
import Author from '@Content/Author/Author'

const PackageInfo = ({ className, packageData, ...restProps }) => {
  const classes = styles('package-info', {
    selectors: [
      className,
    ],
  })

  return <Card className={classes} {...restProps} gutter="xsmall">
    <UList autoPunctuation={false} iconSize="normal">
      <UListItem icon="dev-terminal"><InlineCode>{packageData.name}</InlineCode> <InlineCode>v{packageData.version}</InlineCode></UListItem>
    </UList>
    <Paragraph>{packageData.description}</Paragraph>
    <Grid template="package-info-authors">
      { packageData.repository.url && <Button href={packageData.repository.url.replace('.git', '')}>Repository</Button> }
      { packageData.bugs && <Button variant="secondary-outline" href={packageData.bugs.url.replace('.git', '')}>Issue</Button> }
    </Grid>
    <Hr spacing="small" className="background-color-adjust-tone-18"/>
    <Row><H4>Contributors</H4><Tag chip={true} icon="user-team" className="background-color-brand-maggioli-20 color-brand-maggioli-08">{ packageData.contributors.length }</Tag></Row>
    <Grid template="package-info-authors">
      {packageData.contributors.map((item, key) =>
        <Author key={key} gravatar={`${item.email}?s=120&d=mp`}>
          <H5>{item.name}</H5>
          {item.role && <Caption className="color-adjust-tone-08">{item.role}</Caption>}
        </Author>,
      )}
    </Grid>
  </Card>
}

PackageInfo.propTypes = {
  ...Card.propTypes,
  className: PropTypes.string,
  packageData: PropTypes.object,
}

PackageInfo.defaultProps = {
  boxShadow: 'soft',
}

export default PackageInfo
