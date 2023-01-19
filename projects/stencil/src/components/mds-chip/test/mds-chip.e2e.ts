import { newE2EPage } from '@stencil/core/testing'

describe('mds-chip', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-chip></mds-chip>')

    const element = await page.find('mds-chip')
    expect(element).toHaveAttribute('hydrated')
  })
})
