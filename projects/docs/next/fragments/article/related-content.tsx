import clsx from 'clsx'
import { FC, ReactNode } from 'react'

interface ArticleRelatedContentProps {
  className?: string,
  children?: ReactNode,
  title?: string,
}

const ArticleRelatedContent: FC<ArticleRelatedContentProps> = ({ children, className, title }: ArticleRelatedContentProps): JSX.Element =>
  <div className={clsx('gap-2 border-l border-solid border-0 pl-6 ', className)}>
    { title && <mds-text typography="label" class="mb-4">{ title }</mds-text> }
    { children }
  </div>

export default ArticleRelatedContent
