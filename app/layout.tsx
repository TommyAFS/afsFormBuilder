import type { ReactNode } from 'react'

// Global styles, matching the main repo's _app.tsx:
//  - @afs/styles base (tokens, typography, @font-face -> /fonts via public symlink)
//  - @afs/components global stylesheet (styles every @afs component)
import '@afs/styles/main.scss'
import '@afs/components/styles/website.min.css'

export const metadata = {
  title: 'AFS Form Builder — dev',
}

const RootLayout = ({ children }: { children: ReactNode }) => (
  <html lang="en">
    <body>{children}</body>
  </html>
)

export default RootLayout
