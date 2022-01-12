import { ReactElement, FC } from 'react'
import SectionHeader from './fragments/header/section'
import { LayoutProps } from '../../meta/props/LayoutProps'

const Layout: FC<LayoutProps> = ({ children, title }: LayoutProps): ReactElement => {
  return (
    <main className="pt-20 dark-mode-os">
      <SectionHeader title={title} />
      <div className="grid desktop:grid-cols-section col-start-2 col-stop-2">
        { children }
      </div>
    </main>
  )
}

export default Layout
