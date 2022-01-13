import clsx from 'clsx'
import { Children, FC, ReactNode } from 'react'
import Card from '../card'

interface ArticleRelatedLinksProps {
  className?: string,
  children?: ReactNode,
  title: string,
  description?: string,
}

const ArticleRelatedLinks: FC<ArticleRelatedLinksProps> = ({ children, className, description, title }: ArticleRelatedLinksProps): JSX.Element =>
  <Card className={clsx('gap-2', className)}>
    <mds-text typography="label">{ title }</mds-text>
    { description && <mds-text typography="caption">{ description }</mds-text> }
    <mds-list class="p-0 gap-1">
      { children }
    </mds-list>
  </Card>

export default ArticleRelatedLinks
