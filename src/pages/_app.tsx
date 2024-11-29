import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { useEffect } from 'react'

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Google Analytics initialization
    const GA_ID = process.env.NEXT_PUBLIC_GA_ID

    const script1 = document.createElement('script')
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
    script1.async = true
    document.head.appendChild(script1)

    const script2 = document.createElement('script')
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${GA_ID}');
    `
    document.head.appendChild(script2)
  }, [])

  return (
    <>
      <Component {...pageProps} />
    </>
  )
}
