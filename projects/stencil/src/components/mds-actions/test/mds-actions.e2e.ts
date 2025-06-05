import { newE2EPage } from '@stencil/core/testing'

describe('mds-actions', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-actions></mds-actions>')

    const element = await page.find('mds-actions')
    expect(element).toHaveAttribute('hydrated')
  })
})
