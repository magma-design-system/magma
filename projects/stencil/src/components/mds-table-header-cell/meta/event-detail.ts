import { SortDirectionType } from './types';

export interface MdsTableHeaderCellSortEventDetail {
  direction: SortDirectionType;
  index: number;
  sortKey?: string;
}
