'use client'

import { Component, ReactNode } from 'react'
import dynamic from 'next/dynamic'

import { stubbedBookingFormNewProps } from '../components/organisms/BookingFormNew/test-data'

// Render client-only: the form pulls in real components symlinked from the main
// repo, and SSRing them across the symlink boundary risks a second React copy.
const BookingFormNew = dynamic(
  () => import('../components/organisms/BookingFormNew'),
  { ssr: false, loading: () => <p data-testid="loading">Loading form…</p> }
)

class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <pre style={{ color: 'crimson', whiteSpace: 'pre-wrap' }}>
          {this.state.error.message}
          {'\n\n'}
          {this.state.error.stack}
        </pre>
      )
    }
    return this.props.children
  }
}

const Page = () => (
  <main style={{ maxWidth: 720, margin: '0 auto', padding: '2rem' }}>
    <h1 style={{ color: 'green' }}>Sandbox page mounted ✓</h1>
    <ErrorBoundary>
      <BookingFormNew {...stubbedBookingFormNewProps} />
    </ErrorBoundary>
  </main>
)

export default Page
