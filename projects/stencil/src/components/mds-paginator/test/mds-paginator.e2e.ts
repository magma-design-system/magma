import { newE2EPage } from '@stencil/core/testing'
import { mockIconResponse } from '@test/mock'

describe('mds-paginator', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    mockIconResponse(page)
    await page.setContent('<mds-paginator></mds-paginator>')

    const element = await page.find('mds-paginator')
    expect(element).toHaveAttribute('hydrated')
    expect(true).toBe(true)
  })
})
