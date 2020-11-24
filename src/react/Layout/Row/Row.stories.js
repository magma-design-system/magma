import React from 'react'
import faker from 'faker'
import Table, { TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from '@UI/Table/Table'
import Row from '@Layout/Row/Row'
import Grid from '@Layout/Grid/Grid'
import Button from '@UI/Button/Button'
import Hr from '@UI/Hr/Hr'
import InlineCode from '@UI/InlineCode/InlineCode'
import sizesData from '+Tokens/css-tokens/sizes.json'
const sizes = Object.keys(sizesData.size)
faker.locale = 'it'

const alignList = ['center', 'flex-end', 'flex-start']

export default {
  title: 'Layout/Row',
  component: Row,
}

const word1 = faker.lorem.word()
const word2 = faker.lorem.word()

export const defaultUsage = () =>
  <Row>
    <Button>{word1}</Button>
    <Button>{word2}</Button>
  </Row>

export const lastChild = () =>
  <Row lastChild="to-right">
    <div>
      <Button>{word1}</Button>
    </div>
    <div>
      <Button>{word1}</Button>
    </div>
    <div>
      <Button>{word1}</Button>
    </div>
    <div>
      <Button>{word1}</Button>
    </div>
  </Row>

export const align = () =>
  <Grid>
    {alignList.map(key =>
      <Grid>
        <span>
          <InlineCode>{`${key}`}</InlineCode>
        </span>
        <Row key={key} align={key}>
          <Button>{word1}</Button>
          <Button>{word2}</Button>
        </Row>
        <Hr/>
      </Grid>,
    )}
  </Grid>

export const gutterSizes = () =>
  <Table interactive={true}>
    <TableHeader>
      <TableHeaderCell>Preview</TableHeaderCell>
      <TableHeaderCell>Size</TableHeaderCell>
    </TableHeader>
    <TableBody>
      {sizes.map(key =>
        <TableRow>
          <TableCell>
            <Row key={key} gutter={key}>
              <Button>{word1}</Button>
              <Button>{word2}</Button>
            </Row>
          </TableCell>
          <TableCell>
            <InlineCode>{`${key}`}</InlineCode>
          </TableCell>
        </TableRow>,
      )}
    </TableBody>
  </Table>
