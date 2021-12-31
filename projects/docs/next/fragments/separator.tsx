import clsx from 'clsx'
import { FC } from 'react'

type ComponentProps = {
  className?: string,
}

const Separator: FC<ComponentProps> = ({ className }): JSX.Element => {
  return (
    <div className={clsx('h-px bg-adjust-tone-02', className)}></div>
  )
}

export default Separator
