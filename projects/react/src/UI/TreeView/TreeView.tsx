import React, { Children, cloneElement, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import clsx from 'clsx'

import Grid from '@Layout/Grid/Grid'
import H5 from '@Typography/H5/H5'
import Icon from '@Design/Icon/Icon'
import Row from '@Layout/Row/Row'

import './TreeView.scss'

const TreeViewItem = ({ allChildren, setAllChildren, className, expanded, key, text, ...restProps }) => {
  const [isExpanded, setStatus] = useState(expanded)
  useEffect(() => setStatus(expanded), [expanded])

  const children = Children.map(restProps.children, (child, index) => {
    if (child !== null) {
      //setAllChildren([...allChildren, child])
      return cloneElement(child, {
        allChildren,
        expanded: index === child.key,
        key: allChildren.lenght + index,
        setAllChildren: v => setAllChildren(v),
      })
    }
  })

  return <div onClick={e => { e.stopPropagation() }} className={clsx('tree-view-item', isExpanded && 'tree-view-item--expanded', className)} {...restProps}>
    <Row className={clsx('tree-view-item__button', isExpanded && !children && 'tree-view-item__button--selected')} onClick={() => { deselectOtherItems(key); setStatus(!isExpanded) }}>
      <Icon name={clsx(children ? 'paginator-next' : 'list-dot')} className={clsx('tree-view-item__icon', isExpanded && 'tree-view-item__icon--expanded')}/>
      <H5>{ text }</H5>
    </Row>
    { children && isExpanded && <Grid className="tree-view-item__list">
      { children }
    </Grid>}
  </div>
}

TreeViewItem.propTypes = {
  allChildren: PropTypes.array,
  className: PropTypes.string,
  expanded: PropTypes.bool,
  key: PropTypes.number,
  setAllChildren: PropTypes.func,
  text: PropTypes.string,
}

TreeViewItem.defaultProps = {
  expanded: false,
}

const TreeView = ({ className, ...restProps }) => {

  const [itemIndex, setItemSelected] = useState(null)
  const [allChildren, setAllChildren] = useState([])

  const children = Children.map(restProps.children, (child, index) => {
    if (child !== null) {
      setAllChildren([...allChildren, child])
      return cloneElement(child, {
        key: index,
        expanded: index === itemIndex,
        onClick: () => setItemSelected(index),
        allChildren,
        setAllChildren: v => setAllChildren(v),
      })
    }
  })

  // const deselectAllItems = (index) => {
  //   const firstPart: IAnswer[] = data.slice(0, index);
  //   const secondPart: IAnswer[] = data.slice(index + 1, data.length);
  //   const oldAnswer: IAnswer = data[index];
  //   setData([ ...firstPart, oldAnswer, ...secondPart ]);
  // }

  return <div className={clsx('tree-view', className)} {...restProps}>
    { children }
  </div>
}

export {
  TreeView,
  TreeViewItem,
}
