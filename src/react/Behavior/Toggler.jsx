import React, { Children, cloneElement, Component, createContext } from 'react'
const TogglerContext = createContext()

// https://soshace.com/building-react-components-using-children-props-and-context-api/#crayon-5f80341482005894162361
// https://codesandbox.io/s/github/supromikali/react-children-with-context

const renderChildren = (children, props) => context =>
  Children.map(children, el =>
    cloneElement(el, props(context, el)),
  )

export default class Toggler extends Component {
  state = { isVisible: false }

  setVisible = () =>
    this.setState(({ isVisible }) => ({ isVisible: !isVisible }))

  static Trigger = ({ children }) => (
    <TogglerContext.Consumer>
      {renderChildren(children, context => ({
        onClick: context.setVisible,
      }))}
    </TogglerContext.Consumer>
  )

  static Content = ({ children }) => (
    <TogglerContext.Consumer>
      {renderChildren(children, (context, el) => ({
        visible: context.isVisible,
        onCancel: context.setVisible,
        onConfirm: () => {
          context.setVisible()
          el.props.onConfirm()
        },
      }))}
    </TogglerContext.Consumer>
  )

  render() {
    return (
      <TogglerContext.Provider
        value={{
          visible: this.state.visible,
          setVisible: this.setVisible,
        }}
      >
        {this.props.children}
      </TogglerContext.Provider>
    )
  }
}
