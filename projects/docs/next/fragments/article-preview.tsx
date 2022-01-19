import clsx from 'clsx'
import { FC } from 'react'
import { ReactComponentProps } from '../meta/props/ReactComponent'
import moment from 'moment'
import 'moment/locale/it'

const ArticlePreview: FC<ReactComponentProps> = ({ className }: ReactComponentProps): JSX.Element => {
  return (
    <div className={clsx('flex flex-col gap-8', className)}>
      <div className="flex flex-col gap-4">
        <div>
          <mds-text typography="h4">Lorem ipsum dolr sit amet</mds-text>
          <mds-text typography="label">Mario Rossi — { moment('2022-01-03', 'YYYY-MM-DD').fromNow() }</mds-text>
        </div>
        <mds-text typography="paragraph">Tecnologia e conoscenza sono da sempre le nostre passioni, il nostro business e il modo con cui sia­mo riusciti a rispondere alle richieste di un mercato in continua evoluzione.</mds-text>
      </div>
      <div>
        <mds-button>Leggi articolo</mds-button>
      </div>
    </div>
  )
}

export default ArticlePreview
