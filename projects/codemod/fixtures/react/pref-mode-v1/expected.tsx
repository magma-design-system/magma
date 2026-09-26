import { MdsPref, MdsPrefMode } from '@maggioli-design-system/magma-react';

type ModeProps = React.ComponentProps<typeof MdsPrefMode>;

export const Prefs = (props: ModeProps) => (
  <div className="pref-mode-dark">
    <MdsPref>
      <MdsPrefMode {...props}></MdsPrefMode>
    </MdsPref>
    <mds-pref-mode mode="dark" />
  </div>
);
