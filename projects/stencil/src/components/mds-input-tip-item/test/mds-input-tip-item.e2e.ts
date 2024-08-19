import { newE2EPage } from '@stencil/core/testing'

describe('mds-input-tip-item', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-input-tip-item></mds-input-tip-item>')

    const element = await page.find('mds-input-tip-item')
    expect(element).toHaveAttribute('hydrated')
  })
})
