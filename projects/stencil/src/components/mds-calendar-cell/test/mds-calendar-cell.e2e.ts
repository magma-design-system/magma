import { newE2EPage } from '@stencil/core/testing'

describe('mds-calendar-cell', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-calendar-cell></mds-calendar-cell>')

    const element = await page.find('mds-calendar-cell')
    expect(element).toHaveAttribute('hydrated')
  })
})
