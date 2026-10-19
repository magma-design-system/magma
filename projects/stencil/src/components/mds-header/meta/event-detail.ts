export interface MdsHeaderEventDetail {
  bar: HTMLMdsHeaderBarElement;
}

export interface MdsHeaderVisibilityEventDetail {
  /** The visibility the header has now, the value of its `visibility` prop */
  visibility: 'hidden' | 'visible';
}
