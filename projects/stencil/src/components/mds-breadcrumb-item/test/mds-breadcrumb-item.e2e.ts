import { newE2EPage } from '@stencil/core/testing'

describe('mds-breadcrumb-item', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-breadcrumb-item></mds-breadcrumb-item>')

    const element = await page.find('mds-breadcrumb-item')
    expect(element).toHaveAttribute('hydrated')
    expect(true).toBe(true)
  })
})
