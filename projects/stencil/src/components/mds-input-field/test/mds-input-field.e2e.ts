import { newE2EPage } from '@stencil/core/testing'

describe('mds-input-field', () => {
  it('render default', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-input-field><mds-input><mds-input></mds-input-field>')
    const element = await page.find('mds-input-field')
    const label = await element.find('>>> .label')
    const message = await element.find('>>> .message')

    expect(element).toHaveAttribute('hydrated')
    expect(label).toBeNull()
    expect(message).toBeNull()
  })

  it('render error message on cf input type', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-input-field><mds-input type="cf"><mds-input></mds-input-field><button><button>')
    const element = await page.find('mds-input-field')
    const mdsInput = await element.find('mds-input')

    await mdsInput.click()
    await mdsInput.type('abc')
    // trigger validation on blur
    await page.click('button')
    await page.waitForChanges()

    expect(element).toEqualAttribute('variant', 'error')
    const message = await element.find('>>> .message')
    expect(message).toBeTruthy()
    expect(message.textContent).toEqual('Codice fiscale inserito non corretto\nCodice fiscale deve essere lungo 16 caratteri' )
  })

  it('render variant success when input is valid', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-input-field><mds-input type="cf"><mds-input></mds-input-field><button><button>')
    const element = await page.find('mds-input-field')
    const mdsInput = await element.find('mds-input')

    await mdsInput.click()
    await mdsInput.type('MRCRSS83B21D704L')
    // trigger validation on blur
    await page.click('button')
    await page.waitForChanges()

    expect(element).toEqualAttribute('variant', 'success')
    const message = await element.find('>>> .message')
    expect(message).toBeNull()
  })

  it('render label', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-input-field label="codice fiscale"><mds-input type="cf"><mds-input></mds-input-field><button><button>')
    const element = await page.find('mds-input-field')
    const label = await element.find('>>> .label')

    await page.waitForChanges()

    expect(label.textContent).toBe('codice fiscale')
  })
})
