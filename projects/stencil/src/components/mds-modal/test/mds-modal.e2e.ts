import { newE2EPage } from '@stencil/core/testing'

describe('mds-modal', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-modal></mds-modal>')

    const element = await page.find('mds-modal')

    expect(element).toHaveClass('to-center')
    expect(element).toHaveAttribute('hydrated')
    expect(element).toHaveAttribute('position')

    expect(element.getAttribute('position')).toBe('center')

    expect(element).not.toHaveAttribute('opened')
  })

  it('renders opened', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-modal opened="true"></mds-modal>')

    const element = await page.find('mds-modal')

    expect(element).toHaveAttribute('opened')
  })

  it('can be closed', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-modal opened="true"></mds-modal>')

    const element = await page.find('mds-modal')

    expect(element.getAttribute('opened')).not.toBe('false')

    await page.mouse.click(window.innerWidth / 2, window.innerHeight / 2)

    // const mdsIcon = element.shadowRoot.querySelector('mds-icon') as HTMLElement

    // console.info('mdsIcon', mdsIcon)

    // const closeButton = mdsIcon.shadowRoot.querySelector('i') as HTMLElement

    // console.info('closeButton', closeButton)

    // closeButton.click()

    await page.waitForChanges()

    expect(element).not.toHaveClass('opened')
  })
})
