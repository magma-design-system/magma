import clsx from 'clsx'
import { Children, FC, ReactElement, ReactNode, cloneElement } from 'react'
import { TypographyType } from '@maggioli-design-system/mds-text/src/types/typography'

interface AsideButtonProps {
  children?: ReactNode,
  className?: string,
  isChildren?: boolean,
  name: string,
  opened?: boolean,
  selected?: boolean,
  typography?: TypographyType,
}

const renderChildren = (children: ReactNode) =>
  Children.map(children, (item: ReactNode, index: number) =>
    cloneElement(item as ReactElement, {
      isChildren: true,
      key: index,
      typography: 'h6',
    }),
  )

const AsideButton: FC<AsideButtonProps> = ({
  children,
  className,
  isChildren = false,
  name,
  opened = false,
  selected = false,
  typography = 'h5',
}: AsideButtonProps): JSX.Element =>
  <div className={clsx(className)}>
    <div className={clsx(
      'border-0 border-l-4 border-solid flex justify-between transition-colors',
      isChildren ? 'px-9 py-3' : 'px-6 py-[0.625rem]',
      opened ? 'text-brand-maggioli-02' : '',
      selected ? 'bg-adjust-tone border-l-brand-maggioli-01 text-brand-maggioli-02' : 'border-l-transparent text-adjust-tone-01',
    )}>
      <div className="flex-grow min-w-0">
        <mds-text typography={typography} class="cursor-pointer hover:text-brand-maggioli-02 inline-flex text-inherit transition-colors">
          { name }
        </mds-text>
      </div>
      { children && <mds-icon class="flex-shrink-0" name="keyboard-arrow-up"/> }
    </div>
    { children &&
      <div>
        { renderChildren(children) }
      </div>
    }
  </div>

export default AsideButton
