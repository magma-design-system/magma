import clsx from 'clsx'
import { FC, ReactNode, Children, cloneElement } from 'react'
import { TypographyType } from '@maggioli-design-system/mds-text/src/types/typography'

interface ComponentProps {
  children?: ReactNode,
  className?: string,
  isChildren?: boolean,
  name: string,
  opened?: boolean,
  selected?: boolean,
  typography?: TypographyType,
}

const renderChildren = (children: ReactNode) => {
  return Children.map(children, (item: ReactNode, index: number) => {
    return cloneElement(item, {
      key: index,
      typography: 'h6',
      isChildren: true,
    })
  })
}

const AsideButton: FC<ComponentProps> = ({
  children,
  className,
  isChildren = false,
  name,
  opened = false,
  selected = false,
  typography = 'h5',
}: ComponentProps): JSX.Element => {

  return (
    <div className={clsx(className)}>
      <div className={clsx(
        'flex justify-between border-solid border-0 border-l-4 transition-colors',
        isChildren ? 'px-9 py-3' : 'px-6 py-[0.625rem]',
        opened ? 'text-brand-maggioli-02' : '',
        selected ? 'bg-adjust-tone border-l-brand-maggioli-01 text-brand-maggioli-02' : 'border-l-transparent text-adjust-tone-05',
      )}>
        <div className="flex-grow min-w-0">
          <mds-text typography={typography} class="cursor-pointer text-inherit transition-colors inline-flex hover:text-brand-maggioli-02">
            { name }
          </mds-text>
        </div>
        { children && <mds-icon name="keyboard-arrow-up" class="flex-shrink-0"/> }
      </div>
      { children &&
        <div>
          { renderChildren(children) }
        </div>
      }
    </div>
  )
}

export default AsideButton
