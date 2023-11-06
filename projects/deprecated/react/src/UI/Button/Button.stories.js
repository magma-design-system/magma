import React from 'react'
import faker from 'faker'
import randomIcon from '@Design/Icon/faker'

import Button from '@UI/Button/Button'
import Grid from '@Layout/Grid/Grid'
import InlineCode from '@UI/InlineCode/InlineCode'
import Table, { TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from '@UI/Table/Table'

import sizeVariants from './dictionary.json'
import cosmetics from '@maggioli-design-system/design-tokens/dist/css-tokens/cosmetics.json'
import sizes from '@maggioli-design-system/design-tokens/dist/css-tokens/sizes.json'
const paddingSizes = sizes.size
const shadows = Object.keys(cosmetics['box-shadow'])
const radius = Object.keys(cosmetics['border-radius'])

faker.locale = 'it'

export default {
  title: 'UI/Button',
  component: Button,
}

export const basicUsage = () =>
  <Button>{faker.hacker.verb()}</Button>

export const withIcon = () =>
  <Button icon={randomIcon()}>{faker.hacker.verb()}</Button>

export const withIconRight = () =>
  <Button icon={randomIcon()} iconPosition="right">{faker.hacker.verb()}</Button>

export const iconButton = () =>
  <Button icon={randomIcon()}/>

export const disabled = () =>
  <Button icon={randomIcon()} disabled={true}>{faker.hacker.verb()}</Button>

export const variants = () =>
  <Grid columns="3">
    <Grid columns="2">
      <Button icon={randomIcon()}>Primary</Button>
      <Button icon={randomIcon()} variant="primary-outline">Primary outline</Button>
      <Button icon={randomIcon()} variant="secondary">Secondary</Button>
      <Button icon={randomIcon()} variant="secondary-outline">Secondary outline</Button>
      <Button icon={randomIcon()} variant="secondary-light">Secondary light</Button>
      <Button icon={randomIcon()} variant="secondary-light-outline">Secondary light outline</Button>
      <Button icon={randomIcon()} variant="info">Info</Button>
      <Button icon={randomIcon()} variant="info-outline">Info outline</Button>
      <Button icon={randomIcon()} variant="success">Success</Button>
      <Button icon={randomIcon()} variant="success-outline">Success outline</Button>
      <Button icon={randomIcon()} variant="warning">warning</Button>
      <Button icon={randomIcon()} variant="warning-outline">warning outline</Button>
      <Button icon={randomIcon()} variant="error">error</Button>
      <Button icon={randomIcon()} variant="error-outline">error outline</Button>
      <Button icon={randomIcon()} variant="link">Link</Button>
      <Button icon={randomIcon()} variant="text" className="text-adjust-tone-04 hover:text-adjust-tone-08">Text</Button>
    </Grid>
  </Grid>

export const size = () =>
  <Table interactive={true}>
    <TableHeader>
      <TableHeaderCell>Preview</TableHeaderCell>
      <TableHeaderCell>Size</TableHeaderCell>
    </TableHeader>
    <TableBody>
      {Object.entries(sizeVariants).map(([key]) =>
        <TableRow>
          <TableCell>
            <Button icon={randomIcon()} size={key}>Size {key}</Button>
          </TableCell>
          <TableCell>
            <InlineCode>{`${key}`}</InlineCode>
          </TableCell>
        </TableRow>,
      )}
    </TableBody>
  </Table>

export const horizontalPadding = () =>
  <Table interactive={true}>
    <TableHeader>
      <TableHeaderCell>Preview</TableHeaderCell>
      <TableHeaderCell>Size</TableHeaderCell>
    </TableHeader>
    <TableBody>
      {Object.entries(paddingSizes).map(([key]) =>
        <TableRow>
          <TableCell>
            <Button icon={randomIcon()} horizontalPadding={key}>Horizontal padding {key}</Button>
          </TableCell>
          <TableCell>
            <InlineCode>{`${key}`}</InlineCode>
          </TableCell>
        </TableRow>,
      )}
    </TableBody>
  </Table>

export const borderRadius = () =>
  <Table interactive={true}>
    <TableHeader>
      <TableHeaderCell>Preview</TableHeaderCell>
      <TableHeaderCell>Size</TableHeaderCell>
    </TableHeader>
    <TableBody>
      {radius.map(key =>
        <TableRow>
          <TableCell>
            <Button key={key} borderRadius={`${key}`} size="xxlarge">Border radius {key}</Button>
          </TableCell>
          <TableCell>
            <InlineCode>{`${key}`}</InlineCode>
          </TableCell>
        </TableRow>,
      )}
    </TableBody>
  </Table>

export const boxShadow = () =>
  <Table interactive={true}>
    <TableHeader>
      <TableHeaderCell>Preview</TableHeaderCell>
      <TableHeaderCell>Size</TableHeaderCell>
    </TableHeader>
    <TableBody>
      {shadows.map(key =>
        <TableRow>
          <TableCell>
            <Button key={key} className="background-color-adjust-tone color-adjust-tone-06" boxShadow={`${key}`}>Shadow {key}</Button>
          </TableCell>
          <TableCell>
            <InlineCode>{`${key}`}</InlineCode>
          </TableCell>
        </TableRow>,
      )}
    </TableBody>
  </Table>

export const submit = () =>
  <Grid template="auto-fill">
    <Button type="submit" icon={randomIcon()}>{faker.hacker.verb()}</Button>
  </Grid>

export const width = () =>
  <Table interactive={true}>
    <TableHeader>
      <TableHeaderCell>Preview</TableHeaderCell>
      <TableHeaderCell>Size</TableHeaderCell>
    </TableHeader>
    <TableBody>
      {['inline', 'fill'].map(key =>
        <TableRow>
          <TableCell>
            <Button icon={randomIcon()} width={key}>Button {key}</Button>
          </TableCell>
          <TableCell>
            <InlineCode>{`${key}`}</InlineCode>
          </TableCell>
        </TableRow>,
      )}
    </TableBody>
  </Table>
