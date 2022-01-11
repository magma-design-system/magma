import clsx from 'clsx'
import { FC } from 'react'
import Separator from '../../../separator'

import { ReactComponentProps } from '../../../../meta/props/ReactComponent'

const AsideMenu: FC<ReactComponentProps> = ({ children, className }: ReactComponentProps): JSX.Element =>
  <aside className={clsx('border-0 border-adjust-tone-04 border-r border-solid relative tablet-max:hidden', className)}>
    <div className="px-6 py-4">
      <mds-img class="h-12 w-12" src="./logo-gruppo-maggioli.svg"/>
    </div>
    <Separator className="mb-6"/>
    { children }
  </aside>

export default AsideMenu
