import React, { Children, cloneElement, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import clsx from 'clsx'

import Grid from '@Layout/Grid/Grid'
import H5 from '@Typography/H5/H5'
import Icon from '@Design/Icon/Icon'
import Row from '@Layout/Row/Row'

import './TreeView.scss'

let totItems: number = 0;

const TreeViewItem = ({ selectItem, itemSelected, className, expanded, key, text, ...restProps }) => {
  const [isExpanded, setStatus] = useState(expanded)
  useEffect(() => setStatus(expanded), [expanded])

  const children = Children.map(restProps.children, (child) => {
    if (child !== null) {
      totItems = totItems + 1;
      return cloneElement(child, {
        expanded: totItems === child.key,
        key: totItems,
        selectItem: selectItem,
        itemSelected: itemSelected,          
      })
    }
  })

  const isSelected = selectItem === key;

  return <div onClick={e => { e.stopPropagation(); selectItem(key); }} className={clsx('tree-view-item', isExpanded && 'tree-view-item--expanded', className)} {...restProps}>
    <Row className={clsx('tree-view-item__button', isSelected && 'tree-view-item__button--selected')} onClick={() => { setStatus(!isExpanded) }}>
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
  key: PropTypes.number,
  text: PropTypes.string,
  selectItem: PropTypes.func,
  itemSelected: PropTypes.number,
}

TreeViewItem.defaultProps = {
  expanded: false,
  selectItem: () => {},
  itemSelected: 0,
}

const TreeView = ({ className, ...restProps }) => {

  const [itemOpened, setItemOpened] = useState(null);
  const [itemSelected, setItemSelected] = useState(0);

  const children = Children.map(restProps.children, (child, index) => {
    if (child !== null) {
      totItems = totItems + 1;
      return cloneElement(child, {
        key: totItems,
        expanded: index === itemOpened,
        onClick: () => setItemOpened(index),
        selectItem: setItemSelected,
        itemSelected: itemSelected,
      })
    }
  })

  return <div className={clsx('tree-view', className)} {...restProps}>
    { children }
  </div>
}

export {
  TreeView,
  TreeViewItem,
}
