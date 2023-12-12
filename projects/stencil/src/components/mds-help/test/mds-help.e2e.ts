import { newE2EPage } from '@stencil/core/testing'
import { mockIconResponse } from '@test/mock'

describe('mds-help', () => {
  it('renders without icon', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-help icon=""></mds-help>')

    const element = await page.find('mds-help')
    expect(element).toHaveAttribute('hydrated')
  })

  it('renders with icon', async () => {
    const page = await newE2EPage()

    mockIconResponse(page)
    await page.setContent('<mds-help></mds-help>')
    const element = await page.find('mds-help')
    expect(element).toHaveAttribute('hydrated')
  })
})


