import '@maggioli-design-system/design-tokens/dist/css/colors-rgb.css'
import '@maggioli-design-system/icons/base64/mgg-icons-font-face.css'
import 'typeface-karla'
import 'typeface-roboto'
import '../styles/globals.css'
import { useRouter } from 'next/router'
import NProgress from 'nprogress'
import type { AppProps } from 'next/app'
import '../styles/nprogress.css'
import React from 'react'

import {
  applyPolyfills as apMdsText,
  defineCustomElements as dceMdsText,
} from '@maggioli-design-system/mds-text/loader'

apMdsText().then(void dceMdsText())

const MyApp = ({ Component, pageProps }: AppProps): JSX.Element => {

  const router = useRouter()

  React.useEffect(() => {
    const handleStart = (url: any): void => {
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
  return <Component {...pageProps} />
}

export default MyApp
