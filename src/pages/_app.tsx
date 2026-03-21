import type { FC } from 'react'
import type { AppProps } from 'next/app'
import { useEffect } from 'react'
import '@/styles/globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import { rehydrateAuthStore } from '@/stores/authStore'

const App: FC<AppProps> = ({ Component, pageProps }) => {
  useEffect(() => {
    rehydrateAuthStore()
  }, [])

  if (!Component) {
    return null
  }

  return (
    <ThemeProvider>
      <Component {...pageProps} />
    </ThemeProvider>
  )
}

export default App
