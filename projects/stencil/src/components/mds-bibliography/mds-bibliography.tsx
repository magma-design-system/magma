import { Component, Host, h, Prop } from '@stencil/core'
import { BibliographyFormatType, BibliographyRelationshipType } from './meta/types'
import { TypographyInfoType, TypographyReadType, TypographyVariants } from '@type/typography'
import { FormattedAuthor } from './meta/interface'

@Component( {
  tag: 'mds-bibliography',
  styleUrl: 'mds-bibliography.css',
  shadow: true,
} )
export class MdsBibliography {
  private separator = {
    apa: '&',
    mla: 'e',
    turabian: '&',
  }

  /**
   * Specifies the bibliography format to rapresent the bibliography content
   */
  @Prop() readonly format: BibliographyFormatType = 'apa'

  /**
   * Specifies a single or mupltiple authors, this field expect a string or an array of strings.
   * First name and Last name: "Jhon Doe",
   * you can wrap first name or last name to crop them correctly: "'Jhon Arthur' Doe", "'Jhon Arthur' 'Doe Jhonson'",
   * and for multiple authors "'Jhon Arthur' 'Doe Jhonson', 'Mike Collins', Erik 'Ross Anderson'",
   * you can use single or double quotation marks for composite names
   */
  @Prop() readonly author?: string

  /**
   * Specifies the name of the bibliography
   */
  @Prop() readonly name?: string

  /**
   * Specifies the publisher of the bibliography
   */
  @Prop() readonly publisher?: string

  /**
   * Specifies the date of the bibliography
   */
  @Prop() readonly date?: string

  /**
   * Specifies the location of the bibliography
   */
  @Prop() readonly location?: string

  /**
   * Specifies relationship between the current document and the URL
   */
  @Prop() readonly rel: BibliographyRelationshipType = 'external'

  /**
   * Specifies the font typography of the element
   */
  @Prop() readonly typography: TypographyInfoType | TypographyReadType = 'detail'

  /**
   * Specifies the variant for `typography`
   */
  @Prop() readonly variant?: TypographyVariants

  /**
   * Specifies the URL of the bibliography
   */
  @Prop() readonly url?: string

  private monthName = ( index: number ) => {
    const names = [
      'Gennaio',
      'Febbraio',
      'Marzo',
      'Aprile',
      'Maggio',
      'Giugno',
      'Luglio',
      'Agosto',
      'Settembre',
      'Ottobre',
      'Novembre',
      'Dicembre',
    ]
    return names[ index ]
  }

  private getDate = (data: string) => {return new Date( isNaN(Number(data)) ? data : parseInt(data) )}

  private dateFormatAPA = (date: string): string => {
    // 2001, August
    const dateData = this.getDate(date)
    if (dateData.toString() === 'Invalid Date') return ''
    return `${dateData.getFullYear()}, ${this.monthName(dateData.getMonth())} ${dateData.getDate()}`
  }

  private dateFormatMLA = (date: string): string => {
    // 21 July 1986
    const dateData = this.getDate(date)
    if (dateData.toString() === 'Invalid Date') return ''
    return `${dateData.getDate()} ${this.monthName(dateData.getMonth())} ${dateData.getFullYear()}`
  }

  private fullNameAPA = ( firstName: string, lastName: string ): string => {
    let formattedFirstName = ''
    if ( firstName.includes( ' ' ) ) {
      const splitName = new RegExp( /(\w+)/, 'g' )
      firstName.match( splitName )?.forEach( ( word: string ) => {
        formattedFirstName = `${formattedFirstName} ${word.substring( 0, 1 )}.`
      } )
    } else {
      formattedFirstName = ` ${firstName.substring( 0, 1 )}.`
    }
    return `${lastName}${lastName ? ',' : ''}${formattedFirstName}`
  }

  private fullNameMLA = ( firstName: string, lastName: string ): string => {
    let formattedFirstName = ''
    if ( firstName.includes( ' ' ) ) {
      const splitName = new RegExp( /(\w+)/, 'g' )
      firstName.match( splitName )?.forEach( ( word: string, index: number ) => {
        formattedFirstName = index === 0 ? word : `${formattedFirstName} ${word.substring( 0, 1 )}.`
      } )
    } else {
      formattedFirstName = firstName
    }
    return `${lastName}${lastName ? ',' : ''} ${formattedFirstName}`
  }

  private formatAuthors = ( author: string ): FormattedAuthor => {
    const authorName = author.replace( /"/g, '\'' )
    const splitNames = new RegExp( /([A-Za-z ]{2,})/g )
    const fullName = authorName.match( splitNames ) ?? authorName
    if ( fullName.length > 1 ) {
      const firstName = fullName[ 0 ].trim()
      const lastName = fullName[ 1 ] ? fullName[ 1 ].trim() : ''
      return {
        apa: this.fullNameAPA( firstName, lastName ),
        firstName,
        lastName,
        mla: this.fullNameMLA( firstName, lastName ),
        turabian: this.fullNameMLA( firstName, lastName ),
      }
    }

    const firstName = fullName[ 0 ].split( ' ' )[ 0 ].trim()
    const lastName = fullName[ 0 ].split( ' ' )[ 1 ] ? fullName[ 0 ].split( ' ' )[ 1 ].trim() : ''
    return {
      apa: this.fullNameAPA( firstName, lastName ),
      firstName,
      lastName,
      mla: this.fullNameMLA( firstName, lastName ),
      turabian: this.fullNameMLA( firstName, lastName ),
    }
  }

  private normalizeAuthors = ( authors: string ): FormattedAuthor[] => {

    const authorsList: FormattedAuthor[] = []
    if ( authors.includes( ',' ) ) {
      const authorsRawList = authors.split( ',' )
      authorsRawList.forEach( ( author: string ) => {
        authorsList.push( this.formatAuthors( author ) )
      } )
      return authorsList
    }

    authorsList.push( this.formatAuthors( authors ) )

    return authorsList
  }

  private showAuthors = ( authors: FormattedAuthor[] ): string => {

    let authorsList = ''
    authors.forEach( ( author, index: number ) => {
      authorsList = index === 0 ? author[ this.format ] : `${authorsList}, ${this.separator[ this.format ]} ${author[ this.format ]}`
    } )
    return authorsList
  }

  render () {
    return (
      <Host>
        <mds-text typography={this.typography} variant={this.variant}>
          {this.author && <span>{this.showAuthors( this.normalizeAuthors( this.author ) )}</span>}
          {this.format === 'mla' &&
            <span>
              {this.name && ' '}
              {this.name &&
                this.url !== null
                ? <a class="link focus-bounce" href={this.url} target="_blank" rel={this.rel}><b><i>{this.name}.</i></b></a>
                : <b><i>{this.name}.</i></b>
              }
              {this.location && <span> {this.location}{this.publisher !== undefined ? ':' : '.'}</span>}
              {this.publisher && <span> {this.publisher}{this.date !== undefined ? ',' : '.'}</span>}
              {this.date && <time dateTime={this.date}> {this.dateFormatMLA( this.date )}.</time>}
            </span>
          }
          {this.format === 'apa' &&
            <span>
              {this.date && <time dateTime={this.date}> ({this.dateFormatAPA( this.date )}).</time>}
              {this.name && ' '}
              {this.name &&
                this.url !== null
                ? <a class="link focus-bounce" href={this.url} target="_blank" rel={this.rel}><b><i> {this.name}.</i></b></a>
                : <b><i> {this.name}.</i></b>
              }
              {this.location && <span> {this.location}{this.publisher !== undefined ? ':' : '.'}</span>}
              {this.publisher && <span> {this.publisher}.</span>}
            </span>
          }
          {this.format === 'turabian' &&
            <span>
              {this.name && ' '}
              {this.name &&
                this.url !== null
                ? <a class="link focus-bounce" href={this.url} target="_blank" rel={this.rel}><b><i> {this.name}.</i></b></a>
                : <b><i> {this.name}.</i></b>
              }
              {this.location && <span> {this.location}{this.publisher !== undefined ? ':' : ','}</span>}
              {this.publisher && <span> {this.publisher}{this.date !== undefined ? ',' : '.'}</span>}
              {this.date && <time dateTime={this.date}> {this.dateFormatMLA( this.date )}.</time>}
            </span>
          }
        </mds-text>
      </Host>
    )
  }
}
