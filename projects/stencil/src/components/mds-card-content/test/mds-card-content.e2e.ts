import { newE2EPage } from '@stencil/core/testing'

describe('mds-card-content', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-card-content></mds-card-content>')

    const element = await page.find('mds-card-content')
    expect(element).toHaveAttribute('hydrated')
  })
})
