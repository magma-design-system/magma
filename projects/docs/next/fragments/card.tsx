import clsx from 'clsx'
import { FC } from 'react'

import { ReactComponentProps } from '../meta/props/ReactComponent'

const Card: FC<ReactComponentProps> = ({ className, children }: ReactComponentProps): JSX.Element =>
  <mds-card class={clsx('border border-adjust-tone-02 border-solid p-4 rounded-md shadow-none bg-transparent', className)}>
    { children }
  </mds-card>

export default Card
