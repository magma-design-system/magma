import { FC } from 'react'
import { LayoutProps } from '../../../../meta/props/LayoutProps'

const Header: FC<LayoutProps> = ({ title, children }): JSX.Element =>
  <div className="desktop:grid tablet-max:flex desktop:grid-cols-section fixed top-0 left-0 right-0 z-30">
    <mds-header class="px-0 desktop:col-start-2 tablet-max:w-full">
      <mds-header-bar class="border-0 border-adjust-tone-02 border-b border-solid desktop:px-0 blur-overlay shadow-none static">
        <div className="flex gap-4 items-center">
          <mds-img class="h-12 w-12 desktop:-ml-12 desktop:opacity-0" src="./logo-gruppo-maggioli.svg"/>
          <div className="desktop:order-2 desktop:pl-2">
            <mds-text typography="h6">Maggioli Design System</mds-text>
            { title && <mds-text typography="h6">{ title }</mds-text> }
          </div>
        </div>
        <mds-button slot="nav" variant="dark" tone="quiet" class="text-adjust-tone-04 hover:text-brand-maggioli-01 hover:bg-brand-maggioli-03/10 text-primary-h6">Governance</mds-button>
        <mds-button slot="nav" variant="dark" tone="quiet" class="text-adjust-tone-04 hover:text-brand-maggioli-01 hover:bg-brand-maggioli-03/10 text-primary-h6">Content</mds-button>
        <mds-button slot="nav" variant="dark" tone="quiet" class="text-adjust-tone-04 hover:text-brand-maggioli-01 hover:bg-brand-maggioli-03/10 text-primary-h6">Design</mds-button>
        <mds-button slot="nav" variant="dark" tone="quiet" class="text-adjust-tone-04 hover:text-brand-maggioli-01 hover:bg-brand-maggioli-03/10 text-primary-h6">Develop</mds-button>
        <mds-button slot="nav" variant="dark" tone="quiet" class="text-adjust-tone-04 hover:text-brand-maggioli-01 hover:bg-brand-maggioli-03/10" icon="search"/>
        <mds-avatar slot="nav" initials="vv" src="https://it.gravatar.com/userimage/1219639/98ec57f59516a7a1ee21b25189ec046a.png?size=64" class="mr-6 w-8 h-8"/>
      </mds-header-bar>
      <div slot="nav-mobile" className="flex flex-col gap-4 p-4">
        <mds-text>Contenuti dell&apos;account avatar</mds-text>
      </div>
    </mds-header>
  </div>

export default Header
