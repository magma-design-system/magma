import { newE2EPage } from '@stencil/core/testing'

describe('mds-notification', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent(`<mds-notification target="#my-button" visible></mds-notification>
    <mds-button id="my-button">Incoming messages</mds-button>`)
    const element = await page.find('mds-notification')
    expect(element).toHaveAttribute('hydrated')
  })
})
