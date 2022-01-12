import clsx from 'clsx'
import { FC, ReactNode } from 'react'

export interface ArticleHeaderProps {
  children?: ReactNode,
  className?: string,
  title: string,
}

const ArticleHeader: FC<ArticleHeaderProps> = ({
  className = '',
  title = 'Lorem ipsum dolr sit amet',
}: ArticleHeaderProps): JSX.Element =>
  <div className={clsx('-mx-6 blur-overlay flex flex-col gap-2 min-h-32 pt-8 px-6', className)}>
    <mds-text typography="h1" class="max-w-title">{ title }</mds-text>
    <mds-text typography="label">6 febbraio 2019 / lettura da 9 min </mds-text>
  </div>

export default ArticleHeader
