import { UIPreferenceType, PreferenceThemeModeType } from '@type/preference';

export interface MdsPrefEventDetail {
  theme: PreferenceThemeModeType;
}

export interface MdsPrefChangeEventDetail {
  preference: UIPreferenceType;
}
