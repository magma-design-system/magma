import { newE2EPage } from '@stencil/core/testing'

describe('mds-tree', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-tree></mds-tree>')

    const element = await page.find('mds-tree')
    expect(element).toHaveClass('hydrated')
  })
})
