import { newE2EPage } from '@stencil/core/testing'

describe('mds-input', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-input></mds-input>')

    const element = await page.find('mds-input')
    expect(element).toHaveAttribute('hydrated')
    expect(true).toBe(true)
  })
})
