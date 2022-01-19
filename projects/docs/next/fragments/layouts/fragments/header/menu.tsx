import { FC, Fragment } from 'react'
import { LayoutProps } from '../../../../meta/props/LayoutProps'

const Menu: FC<LayoutProps> = (): JSX.Element =>
  <Fragment>
    <mds-button icon="signpost" slot="nav" variant="dark" tone="quiet" class="text-adjust-tone-04 hover:text-brand-maggioli-01 hover:bg-brand-maggioli-03/10 wide:flex hidden">Governance</mds-button>
    <mds-button slot="nav" variant="dark" tone="quiet" class="text-adjust-tone-04 hover:text-brand-maggioli-01 hover:bg-brand-maggioli-03/10 flex wide:hidden">Governance</mds-button>

    <mds-button icon="description" slot="nav" variant="dark" tone="quiet" class="text-adjust-tone-04 hover:text-brand-maggioli-01 hover:bg-brand-maggioli-03/10 wide:flex hidden">Content</mds-button>
    <mds-button slot="nav" variant="dark" tone="quiet" class="text-adjust-tone-04 hover:text-brand-maggioli-01 hover:bg-brand-maggioli-03/10 flex wide:hidden">Content</mds-button>
    <mds-button icon="palette" slot="nav" variant="dark" tone="quiet" class="text-adjust-tone-04 hover:text-brand-maggioli-01 hover:bg-brand-maggioli-03/10 wide:flex hidden">Design</mds-button>
    <mds-button slot="nav" variant="dark" tone="quiet" class="text-adjust-tone-04 hover:text-brand-maggioli-01 hover:bg-brand-maggioli-03/10 flex wide:hidden">Design</mds-button>
    <mds-button icon="handyman" slot="nav" variant="dark" tone="quiet" class="text-adjust-tone-04 hover:text-brand-maggioli-01 hover:bg-brand-maggioli-03/10 wide:flex hidden">Develop</mds-button>
    <mds-button slot="nav" variant="dark" tone="quiet" class="text-adjust-tone-04 hover:text-brand-maggioli-01 hover:bg-brand-maggioli-03/10 flex wide:hidden">Develop</mds-button>

    <mds-button slot="nav" variant="dark" tone="quiet" class="text-adjust-tone-04 hover:text-brand-maggioli-01 hover:bg-brand-maggioli-03/10" icon="search"/>
    <mds-avatar slot="nav" initials="vv" src="https://it.gravatar.com/userimage/1219639/98ec57f59516a7a1ee21b25189ec046a.png?size=64" class="w-8 h-8 mr-6"/>
  </Fragment>

const MenuMobile: FC<LayoutProps> = (): JSX.Element =>
  <Fragment>
    <mds-button variant="dark" tone="quiet">Governance</mds-button>
    <mds-button variant="dark" tone="quiet">Content</mds-button>
    <mds-button variant="dark" tone="quiet">Design</mds-button>
    <mds-button variant="dark" tone="quiet">Develop</mds-button>
  </Fragment>

export {
  Menu,
  MenuMobile,
}
