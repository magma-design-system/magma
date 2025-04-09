import { newE2EPage } from '@stencil/core/testing'

describe('mds-input-date-range-preselection', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-input-date-range-preselection></mds-input-date-range-preselection>')

    const element = await page.find('mds-input-date-range-preselection')
    expect(element).toHaveAttribute('hydrated')
  })
})
