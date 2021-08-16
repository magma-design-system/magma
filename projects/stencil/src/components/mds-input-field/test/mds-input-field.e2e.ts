import { newE2EPage } from '@stencil/core/testing'

describe('mds-input-field', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-input-field></mds-input-field>')

    const element = await page.find('mds-input-field')
    expect(element).toHaveClass('hydrated')
  })
})
