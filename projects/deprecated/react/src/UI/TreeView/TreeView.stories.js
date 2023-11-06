import React from 'react'
import TreeView, { TreeViewItem } from '@UI/TreeView/TreeView'
import Card from '@Layout/Card/Card'

export default {
  title: 'UI/Tree View',
  component: TreeViewItem,
}

export const basicUsage = () =>
  <TreeView>
    <TreeViewItem text="Open this element">
      <TreeViewItem text="Children ONE"/>
      <TreeViewItem text="The second child">
        <TreeViewItem text="Children ONE"/>
        <TreeViewItem text="The second child"/>
        <TreeViewItem text="The Final Cut"/>
      </TreeViewItem>
      <TreeViewItem text="The second child">
        <TreeViewItem text="Children ONE"/>
        <TreeViewItem text="The second child"/>
        <TreeViewItem text="The Final Cut"/>
      </TreeViewItem>
      <TreeViewItem text="The Final Cut"/>
    </TreeViewItem>
    <TreeViewItem text="Open this element">
      <TreeViewItem text="Children ONE"/>
      <TreeViewItem text="The second child">
        <TreeViewItem text="Children ONE"/>
        <TreeViewItem text="The second child"/>
        <TreeViewItem text="The Final Cut"/>
      </TreeViewItem>
      <TreeViewItem text="The Final Cut"/>
    </TreeViewItem>
  </TreeView>
