import { E2EPage } from '@stencil/core/testing'

// cant mock directly request on E2EPage
// https://github.com/ionic-team/stencil/issues/2434#issuecomment-714776773
export function mockIconResponse (page: E2EPage): void {
  page.on('response', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (page as any).removeAllListeners('request')
    page.on('request', request => {
      if (!request.url().endsWith('js')) {
        request.respond({
          status: 202,
          body: '',
        })
      } else {
        request.continue()
      }
    })
  })
}
