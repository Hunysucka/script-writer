import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/layout'

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
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<ResearchPage />} />
            <Route path="/write" element={<ScriptWriterPage />} />
            <Route path="/catalog" element={<CatalogsPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
