import { E2EElement, E2EPage, newE2EPage } from '@stencil/core/testing'

describe('mds-input-upload', () => {
  let page: E2EPage
  let component: E2EElement
  beforeEach(async () => {
    page = await newE2EPage()
    await page.setContent('<mds-input-upload></mds-input-upload>')
    component = await page.find('mds-input-upload')
  })

  it('renders', async () => {
    expect(component).toHaveAttribute('hydrated')
  })
})
