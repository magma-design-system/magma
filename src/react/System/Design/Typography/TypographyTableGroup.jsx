import React from 'react'
import PropTypes from 'prop-types'
import Grid from '@Layout/Grid/Grid'
import H3 from '@Typography/H3/H3'
import Caption from '@Typography/Caption/Caption'
import Hack from '@Typography/Hack/Hack'
import './TypographyTableGroup.scss'
import faker from 'faker'

const sentence = faker.lorem.sentence()
const paragraph = faker.lorem.paragraph()

const GroupName = props =>
  <div>
    <H3>{props.children}</H3>
    <Caption>Fallback fonts</Caption>
  </div>

const FontFamilyName = props => {
  const fallbacks = props.family.split(',')
  return (
    <div>
      <H3>{fallbacks[0]}</H3>
      <Hack>{props.family.replace(fallbacks[0] + ',', '')}</Hack>
    </div>
  )
}

FontFamilyName.propTypes = {
  family: PropTypes.string,
}

const StylesCode = props => {
  console.log(props.code)
  return (
    <Grid gutter="none">
      {
        Object.entries(props.code).map(([property, value], index) =>
          <Hack>{property}: {value};</Hack>,
        )
      }
    </Grid>
  )
}

StylesCode.propTypes = {
  code: PropTypes.object,
}

const Styles = props =>
  <Grid>
    {
      Object.entries(props.cssStyles).map(([viewport, styles], index) =>
        <Grid fit={true} gutter="none">
          <Caption>{viewport}</Caption>
          <StylesCode code={styles} />
        </Grid>,
      )
    }
  </Grid>

Styles.propTypes = {
  cssStyles: PropTypes.object,
}

const TypographyTableGroup = props => {
  return (
    <div className="sys-typography-table-group">
      <Grid className="sys-typography-table-group__header">
        <GroupName>{ props.group }</GroupName>
        <FontFamilyName family={props.family} />
      </Grid>
      {
        Object.entries(props.styles).map(([name, cssStyles], index) =>
          <Grid className="sys-typography-table-group__row">
            <div className={`text-${props.group} text-${props.group}--${name}`}>{name}</div>
            <div className={`text-${props.group} text-${props.group}--${name}`}>
              {props.group === 'primary' && sentence}
              {props.group === 'secondary' && paragraph}
            </div>
            <Styles cssStyles={cssStyles}/>
          </Grid>,
        )
      }
    </div>
  )
}

TypographyTableGroup.propTypes = {
  group: PropTypes.string,
  family: PropTypes.string,
  styles: PropTypes.object,
}

export default TypographyTableGroup
