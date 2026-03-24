import { newE2EPage } from '@stencil/core/testing'

describe('mds-input-date-range', () => {
  it('renders', async () => {
    const page = await newE2EPage()
    await page.setContent('<mds-input-date-range></mds-input-date-range>')

    const element = await page.find('mds-input-date-range')
    expect(element).toHaveAttribute('hydrated')
  })

  it('is form-associated and sets form value', async () => {
    const page = await newE2EPage()
    await page.setContent(`
      <form>
        <mds-input-date-range name="period" start-date="2026-01-01" end-date="2026-01-10">
          <mds-input-date slot="start"></mds-input-date>
          <mds-input-date slot="end"></mds-input-date>
        </mds-input-date-range>
      </form>
    `)
    await page.waitForChanges()

    const isFormAssociated = await page.$eval('mds-input-date-range', element => {
      return (element.constructor as typeof HTMLElement & { formAssociated?: boolean }).formAssociated === true
    })
    expect(isFormAssociated).toBe(true)

    const formValue = await page.$eval('form', form => {
      const formData = new FormData(form as HTMLFormElement)
      return formData.get('period')
    })

    expect(formValue).toBe(JSON.stringify({ startDate: '2026-01-01', endDate: '2026-01-10' }))
  })
})
