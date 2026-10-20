// who closed the toast: `timeout` when its `duration` ran out, `close` when the person pressed its
// hide button, `hide` when the application removed `visible`
export interface MdsToastCloseEventDetail {
  reason: 'close' | 'hide' | 'timeout';
}
