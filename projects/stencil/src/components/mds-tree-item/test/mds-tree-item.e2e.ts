import { newE2EPage } from '@stencil/core/testing'

describe('mds-tree-item', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-tree-item></mds-tree-item>')

    const element = await page.find('mds-tree-item')
    expect(element).toHaveClass('hydrated')
  })
})
