import clsx from 'clsx'
import { FC } from 'react'

type ComponentProps = {
  className?: string
}

const ArticleHeader: FC<ComponentProps> = ({ className }): JSX.Element =>
  <div className={clsx('flex flex-col gap-8 min-h-32 pt-8 backdrop-blur-md backdrop-saturate-200 bg-adjust-tone-10/80 -mx-6 px-6', className)}>
    <mds-text typography="h1" class="max-w-title">Lorem ipsum dolr sit amet</mds-text>
  </div>

export default ArticleHeader
