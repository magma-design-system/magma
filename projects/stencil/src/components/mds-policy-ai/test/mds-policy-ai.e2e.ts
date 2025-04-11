import { newE2EPage } from '@stencil/core/testing'

describe('mds-policy-ai', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-policy-ai></mds-policy-ai>')

    const element = await page.find('mds-policy-ai')
    expect(element).toHaveAttribute('hydrated')
  })
})
