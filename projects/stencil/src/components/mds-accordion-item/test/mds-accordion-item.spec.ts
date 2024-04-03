import { SpecPage, newSpecPage } from '@stencil/core/testing'
import { MdsAccordionItem } from '../mds-accordion-item'

describe('mds-accordion', () => {
  let page: SpecPage
  let component : MdsAccordionItem
  beforeEach(async () => {
    page = await newSpecPage({
      components: [MdsAccordionItem],
      html: '<mds-accordion-item></mds-accordion-item>',
    })
    component = page.rootInstance as MdsAccordionItem
  })

  it('should trigger event', async () => {
    const spySelect = jest.spyOn(component.selectedEvent, 'emit')
    const spyChange = jest.spyOn(component.changedEvent, 'emit')
    const spyUnselect = jest.spyOn(component.unselectedEvent, 'emit')

    const button = page.root?.shadowRoot?.querySelector('button')
    button?.click()
    await page.waitForChanges()
    expect(spyChange).toHaveBeenCalledTimes(1)
    expect(spySelect).toHaveBeenCalledTimes(1)
    expect(spyUnselect).not.toHaveBeenCalled()

    button?.click()
    await page.waitForChanges()

    expect(spyChange).toHaveBeenCalledTimes(2)
    expect(spySelect).toHaveBeenCalledTimes(1)
    expect(spyUnselect).toHaveBeenCalledTimes(1)
  })
})
