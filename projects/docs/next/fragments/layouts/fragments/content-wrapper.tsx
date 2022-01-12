import { ReactElement, FC } from 'react'
import clsx from 'clsx'

import { ReactComponentProps } from '../../../meta/props/ReactComponent'

const ContentWrapper: FC<ReactComponentProps> = ({ children, className }: ReactComponentProps): ReactElement =>
  <div className={clsx('px-6 max-w-screen-wide m-auto w-full col-start-2 col-stop-2', className)}>
    { children }
  </div>

export default ContentWrapper
