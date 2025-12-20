import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AmarVote - Secure Election Monitoring & Management System',
  description: 'Real-time incident tracking, vote management, and automated alerts for transparent elections',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
