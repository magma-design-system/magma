import clsx from 'clsx'
import { FC, ReactNode } from 'react'
import moment from 'moment'
import 'moment/locale/it'

export interface ArticleHeaderProps {
  children?: ReactNode,
  className?: string,
  readTime?: number,
  title: string,
}

const ArticleHeader: FC<ArticleHeaderProps> = ({
  className = '',
  readTime = 0,
  title = 'Lorem ipsum dolr sit amet',
}: ArticleHeaderProps): JSX.Element =>
  <div className={clsx('-mx-6 blur-overlay flex flex-col gap-2 min-h-32 pt-8 px-6', className)}>
    <mds-text typography="h1" class="max-w-title">{ title }</mds-text>
    <div>
      <mds-text typography="label">{ moment('2021-03-17', 'YYYY-MM-DD').format('LLLL') } / { moment('2021-03-17', 'YYYY-MM-DD').fromNow() }</mds-text>
      <mds-text typography="label">lettura da { Math.ceil(readTime) } { readTime > 1 ? 'minuti' : 'minuto' }</mds-text>
    </div>
  </div>

export default ArticleHeader
