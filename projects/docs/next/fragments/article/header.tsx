import clsx from 'clsx'
import { FC } from 'react'

type ComponentProps = {
  className?: string
}

const ArticleHeader: FC<ComponentProps> = ({ className }): JSX.Element =>
  <div className={clsx('flex flex-col gap-2 min-h-32 pt-8 desktop:backdrop-blur-md desktop:backdrop-saturate-200 backdrop-saturate-50 desktop:bg-adjust-tone-10/80 bg-adjust-tone-10/90 -mx-6 px-6', className)}>
    <mds-text typography="h1" class="max-w-title">Lorem ipsum dolr sit amet</mds-text>
    <mds-text typography="label">6 febbraio 2019 / 9 min read</mds-text>
  </div>

export default ArticleHeader
