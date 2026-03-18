import { newE2EPage } from '@stencil/core/testing'

describe('mds-radial-progress', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-radial-progress></mds-radial-progress>')

    const element = await page.find('mds-radial-progress')
    expect(element).toHaveAttribute('hydrated')
  })
})
