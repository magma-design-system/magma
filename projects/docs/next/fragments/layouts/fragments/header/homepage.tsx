const Header = (): JSX.Element =>
  <mds-header>
    <mds-header-bar class="sticky top-0 px-0 shadow-none border-b border-0 border-solid border-adjust-tone-02 backdrop-blur-md backdrop-saturate-200 bg-adjust-tone-10/80">
      <div className="flex gap-4 items-center ml-6">
        <mds-img class="h-12 w-12" src="./logo-gruppo-maggioli.svg"/>
        <div className="mb-1">
          <mds-text typography="h5">Magma</mds-text>
          <mds-text typography="option" class="text-adjust-tone-05">Design System</mds-text>
        </div>
      </div>
      <mds-button slot="nav" variant="dark" tone="quiet" class="text-adjust-tone-04 hover:text-brand-maggioli-01 hover:bg-brand-maggioli-03/10">Governance</mds-button>
      <mds-button slot="nav" variant="dark" tone="quiet" class="text-adjust-tone-04 hover:text-brand-maggioli-01 hover:bg-brand-maggioli-03/10">Content</mds-button>
      <mds-button slot="nav" variant="dark" tone="quiet" class="text-adjust-tone-04 hover:text-brand-maggioli-01 hover:bg-brand-maggioli-03/10">Design</mds-button>
      <mds-button slot="nav" variant="dark" tone="quiet" class="text-adjust-tone-04 hover:text-brand-maggioli-01 hover:bg-brand-maggioli-03/10">Develop</mds-button>
      <mds-button slot="nav" variant="dark" tone="quiet" class="text-adjust-tone-04 hover:text-brand-maggioli-01 hover:bg-brand-maggioli-03/10" icon="search"/>
      <mds-avatar slot="nav" initials="vv" src="https://it.gravatar.com/userimage/1219639/98ec57f59516a7a1ee21b25189ec046a.png?size=64" class="w-8 h-8 mr-6"/>
    </mds-header-bar>
    <div slot="nav-mobile" className="flex flex-col gap-4 p-4">
      <mds-button variant="dark" tone="quiet">Governance</mds-button>
      <mds-button variant="dark" tone="quiet">Content</mds-button>
      <mds-button variant="dark" tone="quiet">Design</mds-button>
      <mds-button variant="dark" tone="quiet">Develop</mds-button>
    </div>
  </mds-header>

export default Header
