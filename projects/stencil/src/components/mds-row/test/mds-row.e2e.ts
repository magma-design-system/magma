import { newE2EPage } from '@stencil/core/testing'

describe('mds-row', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-row></mds-row>')

    const element = await page.find('mds-row')
    expect(element).toHaveAttribute('hydrated')
    expect(true).toBe(true)
  })
})
