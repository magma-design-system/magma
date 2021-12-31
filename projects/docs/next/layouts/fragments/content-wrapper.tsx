import { ReactNode, ReactElement, FC } from 'react'
import clsx from 'clsx'

type ContentWrapperProps = {
  children?: ReactNode
  className?: ReactNode
}

const ContentWrapper: FC<ContentWrapperProps> = ({ children, className }): ReactElement => {
  return (
    <div className={clsx('px-6 max-w-screen-wide m-auto w-full', className)}>
      { children }
    </div>
  )
}

export default ContentWrapper
