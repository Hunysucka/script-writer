import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <ErrorFallback
          error={this.state.error}
          onReset={this.handleReset}
        />
      )
    }

    return this.props.children
  }
}

interface ErrorFallbackProps {
  error: Error | null
  onReset: () => void
}

function ErrorFallback({ error, onReset }: ErrorFallbackProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center">
      <div className="mb-6 rounded-full bg-red-100 p-4 dark:bg-red-900/30">
        <svg
          className="h-8 w-8 text-red-600 dark:text-red-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>

      <h2 className="mb-2 font-serif text-xl font-semibold text-ink dark:text-ink-light">
        Something went wrong
      </h2>

      <p className="mb-6 max-w-md text-base text-accent-600 dark:text-accent-400">
        An unexpected error occurred. You can try again or refresh the page.
      </p>

      {error && (
        <details className="mb-6 w-full max-w-md rounded-md border border-accent-200 bg-accent-50 p-4 text-left dark:border-accent-700 dark:bg-accent-900/30">
          <summary className="cursor-pointer text-sm font-medium text-accent-700 dark:text-accent-300">
            Error details
          </summary>
          <pre className="mt-2 overflow-auto text-xs text-red-600 dark:text-red-400">
            {error.message}
          </pre>
        </details>
      )}

      <div className="flex gap-3">
        <button
          onClick={onReset}
          className="rounded-md bg-accent-500 px-5 py-2.5 text-base font-medium text-white transition-colors hover:bg-accent-600"
        >
          Try Again
        </button>
        <button
          onClick={() => window.location.reload()}
          className="rounded-md border border-accent-200 bg-white px-5 py-2.5 text-base font-medium text-accent-700 transition-colors hover:bg-accent-50 dark:border-accent-700 dark:bg-accent-800 dark:text-accent-200 dark:hover:bg-accent-700"
        >
          Refresh Page
        </button>
      </div>
    </div>
  )
}
