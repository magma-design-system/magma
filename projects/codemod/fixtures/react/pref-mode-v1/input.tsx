import { MdsPref, MdsPrefTheme } from '@maggioli-design-system/magma-react';

type ModeProps = React.ComponentProps<typeof MdsPrefTheme>;

export const Prefs = (props: ModeProps) => (
  <div className="pref-theme-dark">
    <MdsPref>
      <MdsPrefTheme {...props}></MdsPrefTheme>
    </MdsPref>
    <mds-pref-theme mode="dark" />
  </div>
);
