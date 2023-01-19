import { newE2EPage } from '@stencil/core/testing'

describe('mds-breadcrumb', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-breadcrumb></mds-breadcrumb>')

    const element = await page.find('mds-breadcrumb')
    expect(element).toHaveAttribute('hydrated')
    expect(true).toBe(true)
  })
})
