import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_SITE_TITLE || 'Wace Dashboard',
  description: process.env.NEXT_PUBLIC_SITE_DESCRIPTION || 'Wace Discord Music Bot Dashboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="/landing/css/bootstrap.min.css" />
        <link rel="stylesheet" href="/landing/css/fontawesome-all.min.css" />
        <link rel="stylesheet" href="/landing/css/feature.css" />
        <link rel="stylesheet" href="/landing/css/animation.css" />
        <link rel="stylesheet" href="/landing/css/slick.css" />
        <link rel="stylesheet" href="/landing/css/slick-theme.css" />
        <link rel="stylesheet" href="/landing/css/bootstrap-select.min.css" />
        <link rel="stylesheet" href="/landing/css/prism.css" />
        <link rel="stylesheet" href="/landing/css/style.css" />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
} 