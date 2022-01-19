import { FC } from 'react'
import { LayoutProps } from '../../../../meta/props/LayoutProps'
import { Menu, MenuMobile } from './menu'

const Header: FC<LayoutProps> = ({ title, children }): JSX.Element =>
  <div className="desktop:grid tablet-max:flex desktop:grid-cols-section fixed top-0 left-0 right-0 z-30">
    <mds-header class="px-0 desktop:col-start-2 tablet-max:w-full">
      <mds-header-bar class="border-0 border-adjust-tone-02 border-b border-solid desktop:px-0 blur-overlay shadow-none static">
        <div className="gap-4 items-center flex w-full flex-shrink">
          <mds-img class="h-12 w-12 desktop:-ml-12 desktop:opacity-0" src="./logo-gruppo-maggioli.svg"/>
          <div className="desktop:order-2 desktop:pl-2 flex flex-col">
            <mds-text class="truncate min-w-0 flex-grow" typography="h6">Maggioli Design System</mds-text>
            { title && <mds-text class="truncate min-w-0 flex-grow" typography="h6">{ title }</mds-text> }
          </div>
        </div>
        <Menu/>
      </mds-header-bar>
      <div slot="nav-mobile" className="flex flex-col gap-4 p-4">
        <MenuMobile/>
      </div>
    </mds-header>
  </div>

export default Header
