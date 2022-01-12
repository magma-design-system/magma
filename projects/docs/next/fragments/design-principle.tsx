import clsx from 'clsx'
import { ReactNode, FC } from 'react'

export interface DesignPrincipleProps {
  children?: ReactNode,
  className?: string,
  description: string,
  title: string,
}

const DesignPrinciple: FC<DesignPrincipleProps> = ({
  className,
  description = 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Consectetur, vel ad. Harum aliquid inventore dolorum non molestiae eius, reprehenderit repellendus blanditiis iusto perspiciatis necessitatibus ipsam consequuntur esse cumque iste mollitia?',
  title = 'Mario bros',
}: DesignPrincipleProps): JSX.Element =>
  <div className={clsx('border-0 border-b border-adjust-tone-02 border-solid -mx-6 px-6 py-16 grid gap-6 wide:grid-cols-4 tablet:grid-cols-2', className)}>
    <mds-text typography="h2" class="text-brand-maggioli-02 truncate">{ title }</mds-text>
    <mds-text typography="paragraph" class="wide:col-span-3">{ description }</mds-text>
  </div>

export default DesignPrinciple
