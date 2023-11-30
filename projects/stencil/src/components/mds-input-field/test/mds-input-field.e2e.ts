import { E2EElement, E2EPage, newE2EPage } from '@stencil/core/testing'

let page: E2EPage
let mdsInputField: E2EElement
let mdsInput: E2EElement
let input: E2EElement

describe('mds-input-field', () => {
  beforeEach(async () => {
    page = await newE2EPage()
    await page.setContent('<mds-input-field></mds-input-field>')
    mdsInputField = await page.find('mds-input-field')
    mdsInput = await page.find('mds-input-field >>> div mds-input')
    input = await page.find('mds-input-field >>> div mds-input >>> input')
  })

  it('renders default', async () => {
    expect(mdsInputField).toHaveAttribute('hydrated')
    expect(mdsInput).not.toBeNull()
    expect(mdsInput).toHaveAttribute('hydrated')
    expect(mdsInput).toEqualAttribute('type', 'text')
    expect(input).not.toBeNull()
  })

  it('default type propagation', async () => {
    await page.$eval('mds-input-field', elm => {
      elm.type = 'tel'
    })
    await page.waitForChanges()

    expect(mdsInputField).toEqualAttribute('type', 'tel')
    expect(mdsInput).toEqualAttribute('type', 'tel')
    expect(input).toEqualAttribute('type', 'tel')
  })

  it('test input typing', async () => {
    const textInput = 'abc'
    mdsInputField
      .getProperty('value')
      .then(value => expect(value).toEqual(''))

    let getErrorsRtnValue = await mdsInputField.callMethod('getErrors')
    expect(getErrorsRtnValue).toBeNull()

    await mdsInputField.click()
    await mdsInputField.type(textInput)

    getErrorsRtnValue = await mdsInputField.callMethod('getErrors')
    expect(getErrorsRtnValue).toBeNull()

    const value = await mdsInputField.getProperty('value')
    expect(value).toBe(textInput)
  })

  it('mds-input-field type cf', async () => {
    await page.$eval('mds-input-field', elm => {
      elm.type = 'cf'
    })
    await page.waitForChanges()

    expect(mdsInputField).toHaveAttribute('type')
    expect(mdsInputField).toEqualAttribute('type', 'cf')

    mdsInputField
      .getProperty('value')
      .then(value => expect(value).toEqual(''))
  })
})

describe('cf validation', () => {
  beforeEach(async () => {
    page = await newE2EPage()
    await page.setContent(`
      <mds-input-field type='cf'></mds-input-field>
      <button><button>
    `)
    mdsInputField = await page.find('mds-input-field')
  })

  it('input type cf validation', async () => {
    const cf = 'MRCRSS83B21D704L'

    await mdsInputField.click()
    await mdsInputField.type(cf)

    // trigger onblur and so validate input of component
    await page.click('button')
    await page.waitForChanges()

    expect(mdsInputField).toEqualAttribute('variant', 'success')
    mdsInputField.getProperty('value').then(value => expect(value).toEqual(cf))

    const getErrorsRtnValue = await mdsInputField.callMethod('getErrors')
    expect(getErrorsRtnValue).toBeNull()
  })

  it('input type cf with invalid cf', async () => {
    const cf = 'abcdefghi'

    await mdsInputField.click()
    await mdsInputField.type(cf)

    // trigger onblur and so validate input of component
    await page.click('button')
    await page.waitForChanges()

    expect(mdsInputField).toEqualAttribute('variant', 'error')
    mdsInputField.getProperty('value').then(value => expect(value).toEqual(cf))

    const getErrorsRtnValue = await mdsInputField.callMethod('getErrors')
    expect(getErrorsRtnValue).not.toBeNull()
  })
})

describe('isbn validation', () => {
  beforeEach(async () => {
    page = await newE2EPage()
    await page.setContent(`
      <mds-input-field type='isbn'></mds-input-field>
      <button><button>
    `)
    mdsInputField = await page.find('mds-input-field')
  })

  it('input type isbn validation', async () => {
    const isbn = '9788843025343'

    await mdsInputField.click()
    await mdsInputField.type(isbn)

    // trigger onblur and so validate input of component
    await page.click('button')
    await page.waitForChanges()

    expect(mdsInputField).toEqualAttribute('variant', 'success')
    mdsInputField.getProperty('value').then(value => expect(value).toEqual(isbn))

    const getErrorsRtnValue = await mdsInputField.callMethod('getErrors')
    expect(getErrorsRtnValue).toBeNull()
  })

  it('input type isbn with invalid isbn', async () => {
    const isbn = 'abcdefghi'

    await mdsInputField.click()
    await mdsInputField.type(isbn)

    // trigger onblur and so validate input of component
    await page.click('button')
    await page.waitForChanges()

    expect(mdsInputField).toEqualAttribute('variant', 'error')
    mdsInputField.getProperty('value').then(value => expect(value).toEqual(isbn))

    const getErrorsRtnValue = await mdsInputField.callMethod('getErrors')
    expect(getErrorsRtnValue).not.toBeNull()
  })
})

describe('custom validation', () => {
  beforeEach(async () => {
    page = await newE2EPage()
    await page.setContent(`
      <mds-input-field></mds-input-field>
      <button><button>
    `)
    mdsInputField = await page.find('mds-input-field')
  })

  it('test custom upper validation', async () => {
    const lower = 'abcd'
    const upper = 'ABCD'

    await page.$eval('mds-input-field', el => {
      const caseValidationfn = (value: string) => {
        return value.toUpperCase() === value ? null : { err: 'lower case' }
      }
      el.addValidator(caseValidationfn)
    })

    // await mdsInputField.callMethod('addValidator', caseValidationfn)

    await mdsInputField.click()
    await mdsInputField.type(lower)

    // trigger onblur and so validate input of component
    await page.click('button')
    await page.waitForChanges()

    expect(mdsInputField).toEqualAttribute('variant', 'error')

    // simulate browser select so text can be replaced
    await mdsInputField.click({ count: 3 })
    await mdsInputField.type(upper)

    // trigger onblur and so validate input of component
    await page.click('button')
    await page.waitForChanges()

    expect(mdsInputField).toEqualAttribute('variant', 'success')
  })
})


describe('form submit', () => {
  it('check submit value', async () => {
    page = await newE2EPage()
    await page.setContent(`
      <form>
        <mds-input-field id="i1" name="i1"></mds-input-field>
        <mds-input-field id="i2" name="i2"></mds-input-field>
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
