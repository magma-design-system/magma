import { newE2EPage } from '@stencil/core/testing'

describe('mds-modal', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-modal></mds-modal>')

    const element = await page.find('mds-modal')

    // La riga seguente non è valida perché `animate-right-intro` viene impostato in `componentDidRender`
    // e quindi appena instanziato non è presente come classe
    // expect(element).toHaveClasses(['animate-right', 'hydrated', 'animate-right-intro'])
    expect(element).toHaveClasses(['animate-right', 'hydrated'])

    expect(element).toHaveAttribute('position')

    expect(element.getAttribute('position')).toBe('right')

    expect(element).not.toHaveAttribute('opened')

    expect(element.shadowRoot).toEqualHtml(`
      <div class="window" role="dialog">
        <slot></slot>
      </div>
      <i class="close svg">
        <svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12z"></path>
        </svg>
      </i>
    `)
  })

  it('renders opened', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-modal opened="true"></mds-modal>')

    const element = await page.find('mds-modal')

    expect(element.getAttribute('opened')).not.toBe('false')

    expect(element.shadowRoot).toEqualHtml(`
      <div class="window" role="dialog">
        <slot></slot>
      </div>
      <i class="close svg">
        <svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12z"></path>
        </svg>
      </i>
    `)
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

    expect(element).not.toHaveAttribute('opened')
  })
})
