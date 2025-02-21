import { newE2EPage } from '@stencil/core/testing'

describe('mds-keyboard', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-keyboard></mds-keyboard>')

    const element = await page.find('mds-keyboard')
    expect(element).toHaveAttribute('hydrated')
  })
})
