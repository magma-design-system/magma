import { newE2EPage } from '@stencil/core/testing'

describe('mds-accordion', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-accordion></mds-accordion>')

    const component = await page.find('mds-accordion')
    expect(component).toHaveAttribute('hydrated')
  })

  it('multiple select', async () => {
    const page = await newE2EPage()
    await page.setContent(`
      <mds-accordion multiple>
        <mds-accordion-item label="primo"></mds-accordion-item>
        <mds-accordion-item label="secondo"></mds-accordion-item>
      </mds-accordion>`)

    const component = await page.find('mds-accordion')
    const [item1, item2] = await component.findAll('mds-accordion-item')

    await item1.click()
    await item2.click()

    expect(item1).toHaveAttribute('selected')
    expect(item2).toHaveAttribute('selected')
  })

  it('should not closable', async () => {
    const page = await newE2EPage()
    await page.setContent(`
      <mds-accordion closable="false">
        <mds-accordion-item label="primo"></mds-accordion-item>
        <mds-accordion-item label="secondo"></mds-accordion-item>
      </mds-accordion>`)

    const component = await page.find('mds-accordion')
    const [item1, item2] = await component.findAll('mds-accordion-item')

    await item1.click()
    expect(item1).toHaveAttribute('selected')

    await item2.click()
    expect(item1).not.toHaveAttribute('selected')
    expect(item2).toHaveAttribute('selected')

    // should not been closed
    await item2.click()
    expect(item2).toHaveAttribute('selected')
  })
})
