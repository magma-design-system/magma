import { ReactNode, ReactElement, FC } from 'react'
import Header from './fragments/header/section'


type LayoutProps = {
  children?: ReactNode
}

const Layout: FC<LayoutProps> = ({ children }): ReactElement => {
  return (
    <main className="pt-20 dark-mode-oss">
      <Header />
      <div className="grid grid-cols-section">
        { children }
      </div>
    </main>
  )
}

export default Layout
