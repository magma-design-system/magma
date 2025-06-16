import { newE2EPage } from '@stencil/core/testing'

describe('mds-user', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-user></mds-user>')

    const element = await page.find('mds-user')
    expect(element).toHaveAttribute('hydrated')
  })
})
