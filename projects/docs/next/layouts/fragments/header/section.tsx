const Header = (): JSX.Element => {
  return (
    <div className="grid grid-cols-section fixed top-0 left-0 right-0 z-20">
      <mds-header class="px-0 col-start-2">
        <mds-header-bar class="static shadow-none border-b border-0 border-solid border-adjust-tone-02 backdrop-blur-md backdrop-saturate-200 bg-adjust-tone-10/80 desktop:px-0">
          <div className="flex gap-4 items-center opacity-0">
            <mds-img class="h-12" src="./logo-gruppo-maggioli.svg"/>
          </div>
          <mds-button slot="nav" variant="dark" tone="quiet" class="text-adjust-tone-04 hover:text-brand-maggioli-01 hover:bg-brand-maggioli-03/10 text-primary-h6">Governance</mds-button>
          <mds-button slot="nav" variant="dark" tone="quiet" class="text-adjust-tone-04 hover:text-brand-maggioli-01 hover:bg-brand-maggioli-03/10 text-primary-h6">Content</mds-button>
          <mds-button slot="nav" variant="dark" tone="quiet" class="text-adjust-tone-04 hover:text-brand-maggioli-01 hover:bg-brand-maggioli-03/10 text-primary-h6">Design</mds-button>
          <mds-button slot="nav" variant="dark" tone="quiet" class="text-adjust-tone-04 hover:text-brand-maggioli-01 hover:bg-brand-maggioli-03/10 text-primary-h6">Develop</mds-button>
          <mds-button slot="nav" variant="dark" tone="quiet" class="text-adjust-tone-04 hover:text-brand-maggioli-01 hover:bg-brand-maggioli-03/10" icon="search"/>
          <mds-avatar slot="nav" initials="vv" src="https://it.gravatar.com/userimage/1219639/98ec57f59516a7a1ee21b25189ec046a.png?size=64" class="mr-6 w-8 h-8"/>
        </mds-header-bar>
        <div slot="nav-mobile" className="flex flex-col gap-4 p-4">
          <mds-button variant="dark" tone="quiet">Governance</mds-button>
          <mds-button variant="dark" tone="quiet">Content</mds-button>
          <mds-button variant="dark" tone="quiet">Design</mds-button>
          <mds-button variant="dark" tone="quiet">Develop</mds-button>
        </div>
      </mds-header>
    </div>
  )
}

export default Header
