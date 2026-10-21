import { MdsInputEventDetail } from '@type/input';

export interface MdsInputSelectEventDetail extends MdsInputEventDetail {
  /**
   * The values of the selected options, the placeholder left out: one with a single select, every
   * selected one with `multiple`, where `value` holds only the first, as `select.value` does.
   */
  values: string[];
}
