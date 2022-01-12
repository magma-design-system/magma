import clsx from 'clsx'
import { FC } from 'react'

import { ReactComponentProps } from '../meta/props/ReactComponent'

const Separator: FC<ReactComponentProps> = ({ className }: ReactComponentProps): JSX.Element =>
  <div className={clsx('h-px bg-adjust-tone-02', className)}></div>

const ArticleSeparator: FC<ReactComponentProps> = ({ className }: ReactComponentProps): JSX.Element =>
  <div className={clsx('h-px bg-adjust-tone-02 -mx-6', className)}></div>

export default Separator
export {
  ArticleSeparator,
}
