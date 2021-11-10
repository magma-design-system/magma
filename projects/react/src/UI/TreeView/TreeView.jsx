import React, { Children, cloneElement, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import clsx from 'clsx'

import Grid from '@Layout/Grid/Grid'
import H5 from '@Typography/H5/H5'
import Icon from '@Design/Icon/Icon'
import Row from '@Layout/Row/Row'

import './TreeView.scss'

let totItems = 0

const TreeViewItem = ({ selectItem, openedItem, itemSelected, className, expanded, itemId, text, onCallback, ...restProps }) => {
  const [isExpanded, setStatus] = useState(expanded)
  const [id, setId] = useState(itemId)

  useEffect(() => setStatus(expanded), [expanded])
  useEffect(() => {
    if (id === itemSelected) {
      selectItem(itemId)
    }
    setId(itemId)
  }, [itemId])

  const children = Children.map(restProps.children, child => {
    if (child !== null) {
      totItems = totItems + 1
      return cloneElement(child, {
        itemId: totItems,
        selectItem,
        itemSelected,
      })
    }
  })

  const select = e => {
    e.stopPropagation()
    onCallback()
    setStatus(!isExpanded)
    selectItem(itemId)
    if (openedItem) {
      openedItem(itemId)
    }
  }

  const isSelected = itemSelected === id

  return <div onClick={e => e.stopPropagation()} className={clsx('tree-view-item', isExpanded && 'tree-view-item--expanded', className)} {...restProps}>
    <Row className={clsx('tree-view-item__button', isSelected && 'tree-view-item__button--selected')} onClick={select}>
      <Icon name={clsx(children ? 'paginator-next' : 'list-dot')} className={clsx('tree-view-item__icon', isExpanded && 'tree-view-item__icon--expanded')}/>
      <H5>{ text }</H5>
    </Row>
    { children && isExpanded && <Grid className="tree-view-item__list">
      { children }
    </Grid>}
  </div>
}

TreeViewItem.propTypes = {
  className: PropTypes.string,
  expanded: PropTypes.bool,
  itemId: PropTypes.number,
  text: PropTypes.string,
  selectItem: PropTypes.func,
  openedItem: PropTypes.func,
  itemSelected: PropTypes.number,
  onCallback: PropTypes.func,
}

TreeViewItem.defaultProps = {
  expanded: false,
  selectItem: () => {},
  itemSelected: 0,
  onCallback: () => {},
}

const TreeView = ({ className, ...restProps }) => {

  const [itemOpened, setItemOpened] = useState(null)
  const [itemSelected, setItemSelected] = useState(0)
  totItems = 0

  const children = Children.map(restProps.children, child => {
    if (child !== null) {
      totItems = totItems + 1
      return cloneElement(child, {
        itemId: totItems,
        expanded: totItems === itemOpened,
        selectItem: setItemSelected,
        openedItem: setItemOpened,
        itemSelected,
      })
    }
  })

  return <div className={clsx('tree-view', className)} {...restProps}>
    { children }
  </div>
}

TreeView.propTypes = {
  className: PropTypes.string,
}

export default TreeView
export {
  TreeViewItem,
}
