import { UIPreferenceType, PreferenceModeType } from '@type/preference';

export interface MdsPrefEventDetail {
  mode: PreferenceModeType;
}

export interface MdsPrefChangeEventDetail {
  preference: UIPreferenceType;
}
