import type { FC } from 'react'
import type { AppProps } from 'next/app'
import { useEffect } from 'react'
import '@/styles/globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import { initPerformanceReporting } from '@/lib/performance'
import { rehydrateAuthStore } from '@/stores/authStore'
import { BroadcastListener } from '@/components/BroadCastListener'

const App: FC<AppProps> = ({ Component, pageProps }) => {
  useEffect(() => {
    rehydrateAuthStore()
    const stopPerf = initPerformanceReporting()
    return () => {
      stopPerf()
    }
  }, [])

  if (!Component) {
    return null
  }

  return (
    <ThemeProvider>
      <BroadcastListener />
      <Component {...pageProps} />
    </ThemeProvider>
  )
}

export default App
