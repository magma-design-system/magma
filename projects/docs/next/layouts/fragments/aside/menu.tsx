import clsx from 'clsx'
import { FC, ReactNode } from 'react'
import Separator from '../../../fragments/separator'

type ComponentProps = {
  className?: string,
  children?: ReactNode,
}

const AsideMenu: FC<ComponentProps> = ({ className, children }): JSX.Element =>
  <aside className={clsx('tablet-max:hidden border-0 border-adjust-tone-04 border-r border-solid relative', className)}>
    <div className="py-4 px-6">
      <mds-img class="h-12 w-12" src="./logo-gruppo-maggioli.svg"/>
    </div>
    <Separator className="mb-6"/>
    { children }
  </aside>

export default AsideMenu
