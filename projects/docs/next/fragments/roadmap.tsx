import clsx from 'clsx'
import { ReactNode, FC } from 'react'

interface RoadmapItemProps {
  children?: ReactNode,
  className?: string,
  description: string,
  done: boolean,
  title: string,
}

const RoadmapItem: FC<RoadmapItemProps> = ({
  className,
  children,
  done,
  description = 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Consectetur, vel ad. Harum aliquid inventore dolorum non molestiae eius, reprehenderit repellendus blanditiis iusto perspiciatis necessitatibus ipsam consequuntur esse cumque iste mollitia?',
  title = 'Brand',
}: RoadmapItemProps): JSX.Element =>
  <mds-details class={clsx(className)}>
    <mds-icon name={ done ? 'check-circle' : 'remove-circle' } class={ done ? 'text-brand-maggioli-04' : 'text-adjust-tone-07'} slot="icon"/>
    <mds-text typography="h6" slot="title">{ title }</mds-text>
    <mds-text typography="caption" class="text-adjust-tone-04">{ description }</mds-text>
    { children }
  </mds-details>

interface RoadmapProps {
  children?: ReactNode,
  className?: string,
  description: string,
  title: string,
}

const Roadmap: FC<RoadmapProps> = ({
  children,
  className,
  description = 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Consectetur, vel ad. Harum aliquid inventore dolorum non molestiae eius, reprehenderit repellendus blanditiis iusto perspiciatis necessitatibus ipsam consequuntur esse cumque iste mollitia?',
  title = 'Brand',
}: RoadmapProps): JSX.Element =>
  <div className={clsx('grid gap-6', className)}>
    <mds-text typography="h4" class="text-brand-maggioli-02">{ title }</mds-text>
    <mds-text class="max-w-text">{ description }</mds-text>
    <div className="grid gap-6 max-w-text">
      { children }
    </div>
  </div>

export {
  Roadmap,
  RoadmapItem,
}
