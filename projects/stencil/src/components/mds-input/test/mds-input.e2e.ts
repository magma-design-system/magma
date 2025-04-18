import { E2EElement, E2EPage, newE2EPage } from '@stencil/core/testing'

let page: E2EPage
let mdsInput: E2EElement
let input: E2EElement

describe('mds-input', () => {
  beforeEach(async () => {
    page = await newE2EPage()
    await page.setContent('<mds-input></mds-input>')
    mdsInput = await page.find('mds-input')
    // mdsInput = await page.find('mds-input >>> div mds-input')
    input = await page.find('mds-input >>> input')
  })

  it('renders default', async () => {
    expect(mdsInput).toHaveAttribute('hydrated')
    // expect(mdsInput).not.toBeNull()
    // expect(mdsInput).toHaveAttribute('hydrated')
    // expect(mdsInput).toEqualAttribute('type', 'text')
    expect(input).not.toBeNull()
  })

  it('default type propagation', async () => {
    await page.$eval('mds-input', elm => {
      elm.type = 'tel'
    })
    await page.waitForChanges()

    expect(mdsInput).toEqualAttribute('type', 'tel')
    expect(mdsInput).toEqualAttribute('type', 'tel')
    expect(input).toEqualAttribute('type', 'tel')
  })

  it('test input typing', async () => {
    const textInput = 'abc'
    mdsInput
      .getProperty('value')
      .then(value => expect(value).toEqual(''))

    let getErrorsRtnValue = await mdsInput.callMethod('getErrors')
    expect(getErrorsRtnValue).toBeNull()

    await mdsInput.click()
    await mdsInput.type(textInput)

    getErrorsRtnValue = await mdsInput.callMethod('getErrors')
    expect(getErrorsRtnValue).toBeNull()

    const value = await mdsInput.getProperty('value')
    expect(value).toBe(textInput)
  })

  it('mds-input type cf', async () => {
    await page.$eval('mds-input', elm => {
      elm.type = 'cf'
    })
    await page.waitForChanges()

    expect(mdsInput).toHaveAttribute('type')
    expect(mdsInput).toEqualAttribute('type', 'cf')

    mdsInput
      .getProperty('value')
      .then(value => expect(value).toEqual(''))
  })
})

describe('cf validation', () => {
  beforeEach(async () => {
    page = await newE2EPage()
    await page.setContent(`
      <mds-input type='cf'></mds-input>
      <button><button>
    `)
    mdsInput = await page.find('mds-input')
  })

  it('input type cf validation', async () => {
    const cf = 'MRCRSS83B21D704L'

    await mdsInput.click()
    await mdsInput.type(cf)

    // trigger onblur and so validate input of component
    await page.click('button')
    await page.waitForChanges()

    expect(mdsInput).toEqualAttribute('variant', 'success')
    mdsInput.getProperty('value').then(value => expect(value).toEqual(cf))

    const getErrorsRtnValue = await mdsInput.callMethod('getErrors')
    expect(getErrorsRtnValue).toBeNull()
  })

  it('input type cf with invalid cf', async () => {
    const cf = 'abcdefghi'

    await mdsInput.click()
    await mdsInput.type(cf)

    // trigger onblur and so validate input of component
    await page.click('button')
    await page.waitForChanges()

    expect(mdsInput).toEqualAttribute('variant', 'error')
    mdsInput.getProperty('value').then(value => expect(value).toEqual(cf))

    const getErrorsRtnValue = await mdsInput.callMethod('getErrors')
    expect(getErrorsRtnValue).not.toBeNull()
  })
})

describe('isbn validation', () => {
  beforeEach(async () => {
    page = await newE2EPage()
    await page.setContent(`
      <mds-input type='isbn'></mds-input>
      <button><button>
    `)
    mdsInput = await page.find('mds-input')
  })

  it('input type isbn validation', async () => {
    const isbn = '9788843025343'

    await mdsInput.click()
    await mdsInput.type(isbn)

    // trigger onblur and so validate input of component
    await page.click('button')
    await page.waitForChanges()

    expect(mdsInput).toEqualAttribute('variant', 'success')
    mdsInput.getProperty('value').then(value => expect(value).toEqual(isbn))

    const getErrorsRtnValue = await mdsInput.callMethod('getErrors')
    expect(getErrorsRtnValue).toBeNull()
  })

  it('input type isbn with invalid isbn', async () => {
    const isbn = 'abcdefghi'

    await mdsInput.click()
    await mdsInput.type(isbn)

    // trigger onblur and so validate input of component
    await page.click('button')
    await page.waitForChanges()

    expect(mdsInput).toEqualAttribute('variant', 'error')

    mdsInput.getProperty('value').then(value => expect(value).toEqual(isbn))

    const getErrorsRtnValue = await mdsInput.callMethod('getErrors')
    expect(getErrorsRtnValue).not.toBeNull()
  })
})

describe('custom validation', () => {
  beforeEach(async () => {
    page = await newE2EPage()
    await page.setContent(`
      <mds-input></mds-input>
      <button><button>
    `)
    mdsInput = await page.find('mds-input')
  })

  it('test custom upper validation', async () => {
    const lower = 'abcd'
    const upper = 'ABCD'

    await page.$eval('mds-input', el => {
      const caseValidationfn = (value: string) => {
        return value.toUpperCase() === value ? null : { err: 'lower case' }
      }
      el.addValidator(caseValidationfn)
    })

    await mdsInput.click()
    await mdsInput.type(lower)

    // trigger onblur and so validate input of component
    await page.click('button')
    await page.waitForChanges()

    let getErrorsRtnValue = await mdsInput.callMethod('getErrors')
    expect(getErrorsRtnValue).toEqual({ err: 'lower case' })
    expect(mdsInput).toEqualAttribute('variant', 'error')

    // simulate browser select so text can be replaced
    await mdsInput.click({ count: 3 })
    await mdsInput.type(upper)

    // trigger onblur and so validate input of component
    await page.click('button')
    await page.waitForChanges()

    getErrorsRtnValue = await mdsInput.callMethod('getErrors')
    expect(getErrorsRtnValue).toBeNull()
    expect(mdsInput).toEqualAttribute('variant', 'success')
  })
})


describe('form submit', () => {
  it('check submit value', async () => {
    page = await newE2EPage()
    await page.setContent(`
      <form>
        <mds-input id="i1" name="i1"></mds-input>
        <mds-input id="i2" name="i2"></mds-input>
        <button type="submit"><button>
      </form>
    `)
    const mdsInputField1 = await page.find('#i1')
    const mdsInputField2 = await page.find('#i2')

    const text1 = 'bella la bestia'
    const text2 = '90min'
    await mdsInputField1.click()
    await mdsInputField1.type(text1)
    await mdsInputField2.click()
    await mdsInputField2.type(text2)

    await page.$eval('form', form => form.addEventListener('submit', e => e.preventDefault()))

    await page.click('button')

    const value1 = await page.$eval('form', f => f.i1.value)
    const value2 = await page.$eval('form', f => f.i2.value)

    expect(value1).toEqual(text1)
    expect(value2).toEqual(text2)

  })
})
