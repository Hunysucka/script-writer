import { useState, useMemo, useEffect } from 'react'
import { toast } from 'sonner'
import { useAppContext } from '@/hooks'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { MarkdownEditor } from '@/components/ui/MarkdownEditor'
import { SkeletonCard } from '@/components/ui/Skeleton'
import type { ResearchReport, Script } from '@/types'

type Tab = 'reports' | 'scripts'

function isReport(item: ResearchReport | Script): item is ResearchReport {
  return 'researchType' in item
}

export function CatalogsPage() {
  const { state, dispatch } = useAppContext()
  const [activeTab, setActiveTab] = useState<Tab>('reports')
  const [search, setSearch] = useState('')
  const [selectedItem, setSelectedItem] = useState<ResearchReport | Script | null>(null)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsInitialLoad(false), 300)
    return () => clearTimeout(timer)
  }, [])

  const filteredReports = useMemo(() => {
    const query = search.toLowerCase()
    return state.reports.filter(
      (r) =>
        r.title.toLowerCase().includes(query) ||
        (r.bookTitle?.toLowerCase().includes(query) ?? false) ||
        (r.authorName?.toLowerCase().includes(query) ?? false) ||
        (r.topic?.toLowerCase().includes(query) ?? false)
    )
  }, [state.reports, search])

  const filteredScripts = useMemo(() => {
    const query = search.toLowerCase()
    return state.scripts.filter(
      (s) =>
        s.title.toLowerCase().includes(query) ||
        s.content.toLowerCase().includes(query)
    )
  }, [state.scripts, search])

  const handleDelete = (id: string, type: 'report' | 'script') => {
    if (type === 'report') {
      dispatch({ type: 'DELETE_REPORT', payload: id })
      toast.success('Report deleted')
    } else {
      dispatch({ type: 'DELETE_SCRIPT', payload: id })
      toast.success('Script deleted')
    }
    setSelectedItem(null)
  }

  const handleCopyContent = () => {
    if (!selectedItem) return
    navigator.clipboard.writeText(selectedItem.content)
    toast.success('Copied to clipboard')
  }

  const getReportSubject = (report: ResearchReport): string => {
    if (report.researchType === 'book') return report.bookTitle || ''
    if (report.researchType === 'author') return report.authorName || ''
    return report.topic || ''
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-ink dark:text-accent-400 sm:text-2xl">Catalog</h1>
        <p className="mt-3 text-lg leading-relaxed text-accent-600 dark:text-accent-400 sm:mt-2 sm:text-base">
          Browse and manage your research reports and scripts.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-accent-200 bg-accent-50 p-1 dark:border-accent-700 dark:bg-accent-900/30">
        {(['reports', 'scripts'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => {
              setActiveTab(tab)
              setSearch('')
            }}
            className={`flex-1 rounded-md px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
              activeTab === tab
                ? 'bg-white text-accent-700 shadow-sm dark:bg-accent-800 dark:text-accent-200'
                : 'text-accent-600 hover:text-accent-800 dark:text-accent-400 dark:hover:text-accent-300'
            }`}
          >
            {tab === 'reports' ? 'Reports' : 'Scripts'}
            <span className="ml-1.5 text-xs text-accent-400 dark:text-accent-500">
              ({tab === 'reports' ? state.reports.length : state.scripts.length})
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <Input
        placeholder={`Search ${activeTab}...`}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* List */}
      <div className="space-y-4">
        {isInitialLoad ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : activeTab === 'reports' ? (
          filteredReports.length === 0 ? (
            <EmptyState type="reports" />
          ) : (
            filteredReports.map((report) => (
              <Card
                key={report.id}
                onClick={() => setSelectedItem(report)}
                className="cursor-pointer transition-all duration-200 hover:border-accent-300 hover:shadow-md dark:hover:border-accent-600"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-accent-100 px-3 py-1 text-sm font-medium text-accent-700 dark:bg-accent-800 dark:text-accent-300 sm:px-2 sm:py-0.5 sm:text-xs">
                        {report.researchType}
                      </span>
                      <h3 className="font-serif text-lg font-medium text-ink dark:text-ink-light sm:text-base">{report.title}</h3>
                    </div>
                    <p className="mt-2 line-clamp-2 text-base leading-relaxed text-accent-600 dark:text-accent-400 sm:mt-1 sm:text-sm">
                      {report.summary}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm text-accent-400 dark:text-accent-500 sm:ml-4 sm:text-xs">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </Card>
            ))
          )
        ) : filteredScripts.length === 0 ? (
          <EmptyState type="scripts" />
        ) : (
          filteredScripts.map((script) => (
            <Card
              key={script.id}
              onClick={() => setSelectedItem(script)}
              className="cursor-pointer transition-all duration-200 hover:border-accent-300 hover:shadow-md dark:hover:border-accent-600"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <h3 className="font-serif text-lg font-medium text-ink dark:text-ink-light sm:text-base">{script.title}</h3>
                  <p className="mt-2 line-clamp-2 text-base leading-relaxed text-accent-600 dark:text-accent-400 sm:mt-1 sm:text-sm">
                    {script.content}
                  </p>
                  <div className="mt-3 flex gap-2 sm:mt-2">
                    <span className="rounded-full bg-accent-100 px-3 py-1 text-sm font-medium text-accent-700 dark:bg-accent-800 dark:text-accent-300 sm:px-2 sm:py-0.5 sm:text-xs">
                      {script.platform}
                    </span>
                    <span className="rounded-full bg-accent-100 px-3 py-1 text-sm font-medium text-accent-700 dark:bg-accent-800 dark:text-accent-300 sm:px-2 sm:py-0.5 sm:text-xs">
                      {script.status}
                    </span>
                  </div>
                </div>
                <span className="shrink-0 text-sm text-accent-400 dark:text-accent-500 sm:ml-4 sm:text-xs">
                  {new Date(script.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Detail Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg border border-accent-200 bg-paper p-6 shadow-xl dark:border-accent-700 dark:bg-paper-dark"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="font-serif text-2xl font-semibold text-ink dark:text-ink-light">
                  {selectedItem.title}
                </h2>
                {isReport(selectedItem) && (
                  <p className="mt-2 text-base italic text-accent-500 dark:text-accent-400">
                    {selectedItem.researchType} · {getReportSubject(selectedItem)}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="rounded-md p-2 text-accent-400 transition-colors hover:bg-accent-100 hover:text-accent-600 dark:hover:bg-accent-800 dark:hover:text-accent-300"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {isReport(selectedItem) ? (
              // Report detail
              <div className="space-y-5">
                <div>
                  <span className="font-serif text-sm font-medium text-accent-700 dark:text-accent-300">Summary</span>
                  <p className="mt-2 leading-relaxed text-ink dark:text-ink-light">{selectedItem.summary}</p>
                </div>
                <div>
                  <span className="font-serif text-sm font-medium text-accent-700 dark:text-accent-300">Content</span>
                  <div className="mt-2">
                    <MarkdownEditor
                      value={selectedItem.content}
                      onChange={() => {}}
                      readOnly
                    />
                  </div>
                </div>
                {selectedItem.sources.length > 0 && (
                  <div>
                    <span className="font-serif text-sm font-medium text-accent-700 dark:text-accent-300">Sources</span>
                    <ul className="mt-2 space-y-1 text-sm leading-relaxed text-accent-600 dark:text-accent-400">
                      {selectedItem.sources.map((source, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-accent-400">•</span>
                          <span>{source}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              // Script detail
              <div className="space-y-5">
                <div className="flex gap-2">
                  <span className="rounded-full bg-accent-100 px-3 py-1 text-sm font-medium text-accent-700 dark:bg-accent-800 dark:text-accent-300">
                    {selectedItem.platform}
                  </span>
                  <span className="rounded-full bg-accent-100 px-3 py-1 text-sm font-medium text-accent-700 dark:bg-accent-800 dark:text-accent-300">
                    {selectedItem.status}
                  </span>
                </div>
                <div>
                  <span className="font-serif text-sm font-medium text-accent-700 dark:text-accent-300">Prompt</span>
                  <p className="mt-2 leading-relaxed text-ink dark:text-ink-light">{selectedItem.prompt}</p>
                </div>
                <div>
                  <span className="font-serif text-sm font-medium text-accent-700 dark:text-accent-300">Script</span>
                  <pre className="mt-2 whitespace-pre-wrap rounded-md border border-accent-200 bg-white p-5 text-base leading-relaxed text-ink dark:border-accent-700 dark:bg-accent-900/30 dark:text-ink-light">
                    {selectedItem.content}
                  </pre>
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-col justify-end gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleCopyContent}
                className="rounded-md px-4 py-2.5 text-base font-medium text-accent-600 transition-colors hover:bg-accent-100 dark:text-accent-400 dark:hover:bg-accent-800 sm:text-sm"
              >
                Copy Content
              </button>
              <button
                type="button"
                onClick={() =>
                  handleDelete(
                    selectedItem.id,
                    isReport(selectedItem) ? 'report' : 'script'
                  )
                }
                className="rounded-md px-4 py-2.5 text-base font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 sm:text-sm"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="rounded-md border border-accent-200 bg-white px-4 py-2.5 text-base font-medium text-accent-700 transition-colors hover:bg-accent-50 dark:border-accent-700 dark:bg-accent-800 dark:text-accent-200 dark:hover:bg-accent-700 sm:text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function EmptyState({ type }: { type: 'reports' | 'scripts' }) {
  return (
    <div className="rounded-lg border border-dashed border-accent-300 py-12 text-center dark:border-accent-700">
      <p className="text-base italic text-accent-500 dark:text-accent-400">
        No {type} yet.{' '}
        {type === 'reports'
          ? 'Start by creating a research report.'
          : 'Generate a script from your reports.'}
      </p>
    </div>
  )
}
