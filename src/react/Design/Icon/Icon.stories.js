import React from 'react'
import PropTypes from 'prop-types'
import faker from 'faker'
import Grid from '@Layout/Grid/Grid'
import Icon from '@Design/Icon/Icon'
import InlineCode from '@UI/InlineCode/InlineCode'
import Table, { TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from '@UI/Table/Table'
import mggIconsDictionary from '+Project/mgg-icons/src/mgg-icons.json'
import './Icon.stories.scss'
import randomIcon from '@Design/Icon/faker'
import sizesData from '+Tokens/css-tokens/sizes.json'
const sizes = Object.keys(sizesData.icon)
faker.locale = 'it'

export default {
  title: 'Design/Icon',
  component: Icon,
}

const IconRow = props =>
  <Grid className="icon-item" gutter="xsmall" htmlTag="label">
    <div><Icon {...props} /></div>
    <input onFocus={event => event.target.select()} className="icon-input text-mono text-mono--hack color-adjust-tone-c-08" type="text" readOnly={true} value={props.name} />
  </Grid>

IconRow.propTypes = {
  name: PropTypes.string,
}

IconRow.defaultProps = {
  name: '',
}

const iconDictionary = Object.keys(mggIconsDictionary).sort().map(key =>
  <IconRow key={key} name={key}/>,
)

export const dictionary = () =>
  <div style={{ textAlign: 'center' }}>
    <Grid template="auto-fill">
      {iconDictionary}
    </Grid>
  </div>

const iconName = randomIcon()

export const basicUsage = () =>
  <Icon name={iconName}/>

export const iconSizes = () =>
  <Table interactive={true}>
    <TableHeader>
      <TableHeaderCell>Preview</TableHeaderCell>
      <TableHeaderCell>Size</TableHeaderCell>
    </TableHeader>
    <TableBody>
      {sizes.map(key =>
        <TableRow>
          <TableCell>
            <Icon name={iconName} size={key}/>
          </TableCell>
          <TableCell>
            <InlineCode>{`${key}`}</InlineCode>
          </TableCell>
        </TableRow>,
      )}
    </TableBody>
  </Table>
