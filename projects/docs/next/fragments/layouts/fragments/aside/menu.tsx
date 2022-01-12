import clsx from 'clsx'
import { FC } from 'react'
import Separator from '../../../separator'

import { ReactComponentProps } from '../../../../meta/props/ReactComponent'

const AsideMenu: FC<ReactComponentProps> = ({ children, className }: ReactComponentProps): JSX.Element =>
  <aside className={clsx('border-0 border-r border-solid border-adjust-tone-04 tablet-max:hidden fixed w-aside h-screen overflow-auto', className)}>
    <div className="relative h-screen">
      <div className="px-6 pt-4 mb-6 sticky top-0 blur-overlay">
        <mds-img class="h-12 w-12" src="./logo-gruppo-maggioli.svg"/>
        <Separator className="mt-4 -mx-6"/>
      </div>
      { children }
    </div>
  </aside>

export default AsideMenu
