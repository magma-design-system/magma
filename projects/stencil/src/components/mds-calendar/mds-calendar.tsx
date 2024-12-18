import { Component, Host, Prop, State, h } from '@stencil/core'
import miBaselineForwardIos from '@icon/mi/baseline/arrow-forward-ios.svg'
import miBaselineBackIosNew from '@icon/mi/baseline/arrow-back-ios-new.svg'
import { DateTime } from 'luxon'

@Component({
  tag: 'mds-calendar',
  styleUrl: 'mds-calendar.css',
  shadow: true,
})
export class MdsCalendar {
  @State() currentDate: DateTime = DateTime.now()
  @State() weekDaysinMonth: DateTime[] = []
  @State() weekdays: string[] = []
  @State() startDateElement: HTMLElement | null = null
  @State() endDateElement: HTMLElement | null = null
  @State() previewElement: HTMLElement | null = null
  @State() isFirstClick: boolean = true

  @Prop({ reflect: true }) startDate: string = '2024-12-12'
  @Prop({ reflect: true }) endDate: string = '2024-12-16'

  startDateTime: DateTime
  endDateTime: DateTime

  currentMonth: string = ''
  currentMonthNumber!: number
  currentYear: string = ''

  componentWillLoad (): void {

    if (this.startDate) {
      this.startDateTime = DateTime.fromISO(this.startDate)
    }
    if (this.endDate) {
      this.endDateTime = DateTime.fromISO(this.endDate)
    }

    this.updateCalendar()
  }

  componentDidLoad (): void {
    this.setDates()
  }



  async updateCalendar (): Promise<void> {
    try {
      const language = navigator.language || 'it-IT'
      const startOfWeek = DateTime.now().startOf('week')
      this.weekdays = Array.from( { length: 7 } ).map((_, index) =>
        startOfWeek.setLocale(language).plus({ days: index }).toFormat('ccc'),
      )
      this.calculateWeekDaysInMonth()
      this.currentMonth = this.currentDate.setLocale('it').toFormat('MMMM')
      this.currentMonthNumber = this.currentDate.month
      this.currentYear = this.currentDate.toFormat('yyyy')
    }
    catch {

    }
  }

  setDates (): void {
    const calendar = document.querySelector('mds-calendar')
    if (!calendar) return

    const { shadowRoot } = calendar
    if (!shadowRoot) return

    const calendarCells = shadowRoot.querySelectorAll('mds-calendar-cell[selection]')
    calendarCells.forEach(day => {
      day.removeAttribute('selection')
      day.removeAttribute('preview')
    })

    if (!this.startDate || !this.endDate) return

    // Converto startDateTime ed endDateTime in oggetti DateTime
    this.startDateTime = DateTime.fromISO(this.startDate)
    this.endDateTime = DateTime.fromISO(this.endDate)

    const cells = shadowRoot.querySelectorAll('mds-calendar-cell')
    if (cells) {
      let isBetweenDates: boolean

      for (let i = 0; i < cells.length; i++) {
        const cellDate = cells[i].getAttribute('date')

        if (cellDate) {
          const currentDate = DateTime.fromISO(cellDate)

          // Impostazione 'start' sulla data di inizio
          if (currentDate.toFormat('yyyy-MM-dd') === this.startDateTime.toFormat('yyyy-MM-dd')) {
            cells[i].setAttribute('selection', 'start')
          }

          // Impostazione 'end' sulla data di fine
          if (currentDate.toFormat('yyyy-MM-dd') === this.endDateTime.toFormat('yyyy-MM-dd')) {
            cells[i].setAttribute('selection', 'end')
          }

          // Impostazione 'middle' sui giorni intermedi
          isBetweenDates = currentDate > this.startDateTime && currentDate < this.endDateTime
          if (isBetweenDates) {
            cells[i].setAttribute('selection', 'middle')
          }
        }
      }
    }
  }




  changeMonth (delta: number): void {
    this.currentDate = this.currentDate.plus({ months: delta })
    this.updateCalendar().then(() => setTimeout(() => this.setDates(), 50))
  }

  calculateWeekDaysInMonth (): void {
    const startOfMonth = this.currentDate.startOf('month')
    const endOfMonth = this.currentDate.endOf('month')
    const allDays: { date: DateTime, isCurrentMonth: boolean }[] = []

    const startWeekday = startOfMonth.weekday
    const daysFromPrevMonth = startWeekday - 1
    const startOfPrevMonth = startOfMonth.minus({ days: daysFromPrevMonth })

    for (let day = startOfPrevMonth; day < startOfMonth; day = day.plus({ days: 1 })) {
      allDays.push({ date: day, isCurrentMonth: false })
    }

    for (let day = startOfMonth; day <= endOfMonth; day = day.plus({ days: 1 })) {
      allDays.push({ date: day, isCurrentMonth: true })
    }

    const endWeekday = endOfMonth.weekday
    const daysFromNextMonth = 7 - endWeekday
    const startOfNextMonth = endOfMonth.plus({ days: 1 })

    for (let day = startOfNextMonth; day < startOfNextMonth.plus({ days: daysFromNextMonth }); day = day.plus({ days: 1 })) {
      allDays.push({ date: day, isCurrentMonth: false })
    }

    this.weekDaysinMonth = allDays
  }

  handleRange (element: HTMLElement, dayInfo: DateTime): void {
    const resetSelection = (): void => {
      this.startDateElement = null
      this.startDateTime = null
      this.endDateElement = null
      this.endDateTime = null
      this.isFirstClick = true

      const calendar = document.querySelector('mds-calendar')
      calendar?.shadowRoot?.querySelectorAll('mds-calendar-cell[selection]').forEach(day => {
        day.removeAttribute('selection')
        day.removeAttribute('preview')
      })
    }

    if (this.startDateElement && this.endDateElement) {
      resetSelection()
    }

    if (this.isFirstClick) {
      this.startDateElement = element
      this.startDateTime = dayInfo
      this.startDate = this.startDateTime.toISO().split('T')[0]
      this.isFirstClick = false
      element.setAttribute('selection', 'start')
      element.setAttribute('preview', 'true')
      return
    }

    const calendar = document.querySelector('mds-calendar')
    const mdsCalendarCellElements = calendar?.shadowRoot?.querySelectorAll('mds-calendar-cell')
    const startDateElementIndex = Array.from(mdsCalendarCellElements ?? []).indexOf(this.startDateElement as HTMLMdsCalendarCellElement)
    const elementIndex = Array.from(mdsCalendarCellElements ?? []).indexOf(element as HTMLMdsCalendarCellElement)

    if (elementIndex < startDateElementIndex) {
      this.startDateElement?.removeAttribute('selection')
      this.startDateElement?.removeAttribute('preview')
      this.startDateElement = element
      this.startDateTime = dayInfo
      element.setAttribute('selection', 'start')
      element.setAttribute('preview', 'true')
    } else {
      element.setAttribute('selection', 'end')
      this.endDateElement = element
      this.endDateTime = dayInfo
      this.endDate = this.endDateTime.toISO().split('T')[0]

      calendar?.shadowRoot?.querySelectorAll('mds-calendar-cell[preview]').forEach(day => {
        day.removeAttribute('preview')
      })

      if (mdsCalendarCellElements) {
        for (let i = startDateElementIndex + 1; i < elementIndex; i++) {
          mdsCalendarCellElements[i].setAttribute('selection', 'middle')
        }
      }

    }
  }

  handleHover ( element: HTMLElement ): void {
    const typedElement = element as HTMLMdsCalendarCellElement
    const startTypedElement = this.startDateElement as HTMLMdsCalendarCellElement
    if (this.startDateElement && this.startDateElement !== element && this.endDateElement === null) {
      const calendar = document.querySelector('mds-calendar')
      const mdsCalendarCellElements = calendar?.shadowRoot?.querySelectorAll('mds-calendar-cell')
      const startIndex = Array.from(mdsCalendarCellElements ?? []).indexOf(startTypedElement)
      const hoverIndex = Array.from(mdsCalendarCellElements ?? []).indexOf(typedElement)

      mdsCalendarCellElements?.forEach((cellDay, index) => {
        if (index >= startIndex && index <= hoverIndex) {
          cellDay.setAttribute('preview', 'true')
          if (index === hoverIndex) {
            cellDay.setAttribute('selection', 'end')
          } else if (index === startIndex) {
            cellDay.setAttribute('selection', 'start')
          } else {
            cellDay.setAttribute('selection', 'middle')
          }
        } else {
          cellDay.removeAttribute('preview')
          cellDay.removeAttribute('selection')
        }
      })
    }
  }

  handleMouseOut (): void {
    if (this.previewElement) {
      this.previewElement.removeAttribute('preview')
    }
  }

  render () {
    return (
      <Host>
        <nav>
          <mds-button class="action-back" icon={miBaselineBackIosNew} variant="dark" tone="quiet" onClick={() => {
            this.changeMonth(-1)
          }}></mds-button>
          <div class="select-month-or-year">
            <mds-button class="action-month" variant="dark" tone="quiet">{this.currentMonth}</mds-button>
            <mds-button class="action-year" variant="dark" tone="quiet">{this.currentYear}</mds-button>
          </div>
          <mds-button class="action-forward" icon={miBaselineForwardIos} variant="dark" tone="quiet" onClick={() => {
            this.changeMonth(1)
          }}></mds-button>
        </nav>
        <section class="month-view">
          <header class="month-view__days-names">
            {/*   <mds-button class="week-day-name" variant="dark" tone="quiet">Lun</mds-button>
            <mds-button class="week-day-name" variant="dark" tone="quiet">Mar</mds-button>
            <mds-button class="week-day-name" variant="dark" tone="quiet">Mer</mds-button>
            <mds-button class="week-day-name" variant="dark" tone="quiet">Gio</mds-button>
            <mds-button class="week-day-name" variant="dark" tone="quiet">Ven</mds-button>
            <mds-button class="week-day-name" variant="dark" tone="quiet">Sab</mds-button>
            <mds-button class="week-day-name" variant="dark" tone="quiet">Dom</mds-button> */}


            {this.weekdays.map(day => (
              <mds-button class="week-day-name" variant="dark" tone="quiet">{day}</mds-button>
            ))}


          </header>
          <div class="month-view__cells">
            {/* <mds-calendar-cell preview selection="start" month="other">30</mds-calendar-cell>
            <mds-calendar-cell preview selection="middle" month="other">31</mds-calendar-cell>
            <mds-calendar-cell preview selection="middle">1</mds-calendar-cell>
            <mds-calendar-cell preview selection="end">2</mds-calendar-cell>
            <mds-calendar-cell>3</mds-calendar-cell>
            <mds-calendar-cell>4</mds-calendar-cell>
            <mds-calendar-cell>5</mds-calendar-cell>
            <mds-calendar-cell>6</mds-calendar-cell>
            <mds-calendar-cell>7</mds-calendar-cell>
            <mds-calendar-cell selection="start">8</mds-calendar-cell>
            <mds-calendar-cell selection="middle">9</mds-calendar-cell>
            <mds-calendar-cell selection="middle">10</mds-calendar-cell>
            <mds-calendar-cell selection="middle">11</mds-calendar-cell>
            <mds-calendar-cell selection="middle">12</mds-calendar-cell>
            <mds-calendar-cell selection="middle">13</mds-calendar-cell>
            <mds-calendar-cell selection="middle">14</mds-calendar-cell>
            <mds-calendar-cell selection="middle">15</mds-calendar-cell>
            <mds-calendar-cell selection="end">16</mds-calendar-cell>
            <mds-calendar-cell>17</mds-calendar-cell>
            <mds-calendar-cell>18</mds-calendar-cell>
            <mds-calendar-cell>19</mds-calendar-cell>
            <mds-calendar-cell>20</mds-calendar-cell>
            <mds-calendar-cell>21</mds-calendar-cell>
            <mds-calendar-cell>22</mds-calendar-cell>
            <mds-calendar-cell>23</mds-calendar-cell>
            <mds-calendar-cell>24</mds-calendar-cell>
            <mds-calendar-cell>25</mds-calendar-cell>
            <mds-calendar-cell>26</mds-calendar-cell>
            <mds-calendar-cell>27</mds-calendar-cell>
            <mds-calendar-cell>28</mds-calendar-cell>
            <mds-calendar-cell>29</mds-calendar-cell>
            <mds-calendar-cell selection="start">30</mds-calendar-cell>
            <mds-calendar-cell selection="middle">31</mds-calendar-cell>
            <mds-calendar-cell selection="middle" month="other">1</mds-calendar-cell>
            <mds-calendar-cell selection="end" month="other">2</mds-calendar-cell> */}

            {/* <mds-calendar-cell month="other">30</mds-calendar-cell>
            <mds-calendar-cell month="other">31</mds-calendar-cell>
            <mds-calendar-cell>1</mds-calendar-cell>
            <mds-calendar-cell>2</mds-calendar-cell>
            <mds-calendar-cell>3</mds-calendar-cell>
            <mds-calendar-cell>4</mds-calendar-cell>
            <mds-calendar-cell>5</mds-calendar-cell>
            <mds-calendar-cell selection="start" orientation="vertical" preview>6</mds-calendar-cell>
            <mds-calendar-cell>7</mds-calendar-cell>
            <mds-calendar-cell>8</mds-calendar-cell>
            <mds-calendar-cell>9</mds-calendar-cell>
            <mds-calendar-cell>10</mds-calendar-cell>
            <mds-calendar-cell>11</mds-calendar-cell>
            <mds-calendar-cell>12</mds-calendar-cell>
            <mds-calendar-cell selection="middle" orientation="vertical" preview>13</mds-calendar-cell>
            <mds-calendar-cell>14</mds-calendar-cell>
            <mds-calendar-cell>15</mds-calendar-cell>
            <mds-calendar-cell>16</mds-calendar-cell>
            <mds-calendar-cell>17</mds-calendar-cell>
            <mds-calendar-cell>18</mds-calendar-cell>
            <mds-calendar-cell>19</mds-calendar-cell>
            <mds-calendar-cell selection="middle" orientation="vertical" preview>20</mds-calendar-cell>
            <mds-calendar-cell>21</mds-calendar-cell>
            <mds-calendar-cell>22</mds-calendar-cell>
            <mds-calendar-cell>23</mds-calendar-cell>
            <mds-calendar-cell>24</mds-calendar-cell>
            <mds-calendar-cell>25</mds-calendar-cell>
            <mds-calendar-cell>26</mds-calendar-cell>
            <mds-calendar-cell selection="end" orientation="vertical" preview>27</mds-calendar-cell>
            <mds-calendar-cell>28</mds-calendar-cell>
            <mds-calendar-cell>29</mds-calendar-cell>
            <mds-calendar-cell>30</mds-calendar-cell>
            <mds-calendar-cell>31</mds-calendar-cell>
            <mds-calendar-cell month="other">1</mds-calendar-cell>
            <mds-calendar-cell month="other">2</mds-calendar-cell>  */}

            {this.weekDaysinMonth.map(dayInfo => {
              return (
                <mds-calendar-cell date={dayInfo.date.toFormat('yyyy-MM-dd')} month={dayInfo.isCurrentMonth ? 'current' : 'other'} onClick={event => this.handleRange(event.target as HTMLElement, dayInfo.date)} onMouseOver={(event => this.handleHover(event.target as HTMLElement))} >
                  {dayInfo.date.toFormat('dd')}
                </mds-calendar-cell>
              )
            })}

          </div>
        </section>
      </Host>
    )
  }
}
