import { FC } from 'react'
import { LayoutProps } from '../../../../meta/props/LayoutProps'
import { Menu, MenuMobile } from './menu'

const Header: FC<LayoutProps> = (): JSX.Element =>
  <mds-header>
    <mds-header-bar class="sticky top-0 px-0 shadow-none border-b border-0 border-solid border-adjust-tone-02 blur-overlay">
      <div className="flex gap-4 items-center ml-6">
        <mds-img class="h-12 w-12" src="./logo-gruppo-maggioli.svg"/>
        <div className="mb-1">
          <mds-text typography="h6">Maggioli Design System</mds-text>
          <mds-text typography="h6">Magma</mds-text>
        </div>
      </div>
      <Menu/>
    </mds-header-bar>
    <div slot="nav-mobile" className="flex flex-col gap-4 p-4">
      <MenuMobile/>
    </div>
  </mds-header>

export default Header
