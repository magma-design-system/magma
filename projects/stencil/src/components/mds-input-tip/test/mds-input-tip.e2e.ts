import { newE2EPage } from '@stencil/core/testing'

describe('mds-input-tip', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-input-tip></mds-input-tip>')

    const element = await page.find('mds-input-tip')
    expect(element).toHaveAttribute('hydrated')
  })
})
