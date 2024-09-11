import { ThemeModeType } from '@component/mds-pref-theme/meta/types'
import { UIPreferenceType } from '@type/preference'

export interface MdsPrefEventDetail {
  theme: ThemeModeType
}

export interface MdsPrefChangeEventDetail {
  preference: UIPreferenceType
}
