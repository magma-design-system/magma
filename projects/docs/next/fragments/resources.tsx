import clsx from 'clsx'
import { FC } from 'react'
import Separator from './separator'
import { ReactComponentProps } from '../meta/props/ReactComponent'

const ResourceItem: FC<ReactComponentProps> = ({ children, className }: ReactComponentProps): JSX.Element => {
  return (
    <div className={clsx('flex justify-between px-0 rounded transition-cosmetic hover:bg-brand-maggioli-09 hover:px-2 hover:text-brand-maggioli-03 cursor-pointer', className)}>
      <mds-text typography="paragraph">{ children }</mds-text>
      <mds-icon name="file-download" class="text-brand-maggioli-03"/>
    </div>
  )
}

const Resources: FC<ReactComponentProps> = ({ className }: ReactComponentProps): JSX.Element => {
  return (
    <div className={clsx('grid gap-2', className)}>
      <mds-text typography="h5" class="text-brand-maggioli-02">Risorse</mds-text>
      <Separator/>
      <ResourceItem>Identity</ResourceItem>
      <Separator/>
      <ResourceItem>Icons</ResourceItem>
      <Separator/>
      <ResourceItem>Figma resources</ResourceItem>
      <Separator/>
      <ResourceItem>Fonts</ResourceItem>
      <Separator/>
    </div>
  )
}

export default Resources
