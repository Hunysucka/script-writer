import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { Layout } from '@/components/layout'
import { ErrorBoundary } from '@/components/ErrorBoundary'

const ResearchPage = lazy(() =>
  import('@/pages/ResearchPage').then((m) => ({ default: m.ResearchPage }))
)
const ScriptWriterPage = lazy(() =>
  import('@/pages/ScriptWriterPage').then((m) => ({ default: m.ScriptWriterPage }))
)
const CatalogsPage = lazy(() =>
  import('@/pages/CatalogsPage').then((m) => ({ default: m.CatalogsPage }))
)

function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent-200 border-t-accent-500 dark:border-accent-700 dark:border-t-accent-400" />
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Toaster position="bottom-right" richColors />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route element={<Layout />}>
              <Route
                path="/"
                element={
                  <ErrorBoundary>
                    <ResearchPage />
                  </ErrorBoundary>
                }
              />
              <Route
                path="/write"
                element={
                  <ErrorBoundary>
                    <ScriptWriterPage />
                  </ErrorBoundary>
                }
              />
              <Route
                path="/catalog"
                element={
                  <ErrorBoundary>
                    <CatalogsPage />
                  </ErrorBoundary>
                }
              />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
