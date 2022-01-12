import '@maggioli-design-system/design-tokens/dist/css/colors-rgb.css'
import '@maggioli-design-system/icons/original/base64/mgg-icons-font-face.css'
import 'typeface-karla'
import 'typeface-roboto'
import '../styles/nprogress.css'
import '../styles/globals.css'
import NProgress from 'nprogress'
import React from 'react'
import type { AppProps } from 'next/app'
import type { NextPage } from 'next'
import type { ReactElement, ReactNode } from 'react'
import { useRouter } from 'next/router'

import { applyPolyfills as apMdsAccordion, defineCustomElements as dceMdsAccordion } from '@maggioli-design-system/mds-accordion/loader'
import { applyPolyfills as apMdsAccordionItem, defineCustomElements as dceMdsAccordionItem } from '@maggioli-design-system/mds-accordion-item/loader'
import { applyPolyfills as apMdsAuthor, defineCustomElements as dceMdsAuthor } from '@maggioli-design-system/mds-author/loader'
import { applyPolyfills as apMdsAvatar, defineCustomElements as dceMdsAvatar } from '@maggioli-design-system/mds-avatar/loader'
import { applyPolyfills as apMdsBadge, defineCustomElements as dceMdsBadge } from '@maggioli-design-system/mds-badge/loader'
import { applyPolyfills as apMdsBenchmarkBar, defineCustomElements as dceMdsBenchmarkBar } from '@maggioli-design-system/mds-benchmark-bar/loader'
import { applyPolyfills as apMdsBibliography, defineCustomElements as dceMdsBibliography } from '@maggioli-design-system/mds-bibliography/loader'
import { applyPolyfills as apMdsButton, defineCustomElements as dceMdsButton } from '@maggioli-design-system/mds-button/loader'
import { applyPolyfills as apMdsCard, defineCustomElements as dceMdsCard } from '@maggioli-design-system/mds-card/loader'
import { applyPolyfills as apMdsGrid, defineCustomElements as dceMdsGrid } from '@maggioli-design-system/mds-grid/loader'
import { applyPolyfills as apMdsHeader, defineCustomElements as dceMdsHeader } from '@maggioli-design-system/mds-header/loader'
import { applyPolyfills as apMdsHeaderBar, defineCustomElements as dceMdsHeaderBar } from '@maggioli-design-system/mds-header-bar/loader'
import { applyPolyfills as apMdsIcon, defineCustomElements as dceMdsIcon } from '@maggioli-design-system/mds-icon/loader'
import { applyPolyfills as apMdsImg, defineCustomElements as dceMdsImg } from '@maggioli-design-system/mds-img/loader'
import { applyPolyfills as apMdsList, defineCustomElements as dceMdsList } from '@maggioli-design-system/mds-list/loader'
import { applyPolyfills as apMdsListItem, defineCustomElements as dceMdsListItem } from '@maggioli-design-system/mds-list-item/loader'
import { applyPolyfills as apMdsModal, defineCustomElements as dceMdsModal } from '@maggioli-design-system/mds-modal/loader'
import { applyPolyfills as apMdsProgress, defineCustomElements as dceMdsProgress } from '@maggioli-design-system/mds-progress/loader'
import { applyPolyfills as apMdsTab, defineCustomElements as dceMdsTab } from '@maggioli-design-system/mds-tab/loader'
import { applyPolyfills as apMdsTabItem, defineCustomElements as dceMdsTabItem } from '@maggioli-design-system/mds-tab-item/loader'
import { applyPolyfills as apMdsText, defineCustomElements as dceMdsText } from '@maggioli-design-system/mds-text/loader'
apMdsAccordion().then(void dceMdsAccordion())
apMdsAccordionItem().then(void dceMdsAccordionItem())
apMdsAuthor().then(void dceMdsAuthor())
apMdsAvatar().then(void dceMdsAvatar())
apMdsBadge().then(void dceMdsBadge())
apMdsBenchmarkBar().then(void dceMdsBenchmarkBar())
apMdsBibliography().then(void dceMdsBibliography())
apMdsButton().then(void dceMdsButton())
apMdsCard().then(void dceMdsCard())
apMdsGrid().then(void dceMdsGrid())
apMdsHeader().then(void dceMdsHeader())
apMdsHeaderBar().then(void dceMdsHeaderBar())
apMdsIcon().then(void dceMdsIcon())
apMdsImg().then(void dceMdsImg())
apMdsList().then(void dceMdsList())
apMdsListItem().then(void dceMdsListItem())
apMdsModal().then(void dceMdsModal())
apMdsProgress().then(void dceMdsProgress())
apMdsTab().then(void dceMdsTab())
apMdsTabItem().then(void dceMdsTabItem())
apMdsText().then(void dceMdsText())

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode
}

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}
const MyApp = ({ Component, pageProps }: AppPropsWithLayout): JSX.Element => {

  const router = useRouter()

  React.useEffect(() => {
    const handleStart = ( url: string ): void => {
      NProgress.start()
    }

    const handleStop = ():void => {
      NProgress.done()
    }

    router.events.on('routeChangeStart', handleStart)
    router.events.on('routeChangeComplete', handleStop)
    router.events.on('routeChangeError', handleStop)

    return () => {
      router.events.off('routeChangeStart', handleStart)
      router.events.off('routeChangeComplete', handleStop)
      router.events.off('routeChangeError', handleStop)
    }
  }, [router])

  const getLayout = Component.getLayout ?? (page => page)
  return getLayout(<Component {...pageProps} />)
}

export default MyApp
