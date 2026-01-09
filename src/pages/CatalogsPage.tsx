import { useState, useMemo } from 'react'
import { useAppContext } from '@/hooks'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { MarkdownEditor } from '@/components/ui/MarkdownEditor'
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
    } else {
      dispatch({ type: 'DELETE_SCRIPT', payload: id })
    }
    setSelectedItem(null)
  }

  const getReportSubject = (report: ResearchReport): string => {
    if (report.researchType === 'book') return report.bookTitle || ''
    if (report.researchType === 'author') return report.authorName || ''
    return report.topic || ''
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Catalog</h1>
        <p className="mt-1 text-gray-600">
          Browse and manage your research reports and scripts.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
        {(['reports', 'scripts'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => {
              setActiveTab(tab)
              setSearch('')
            }}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab === 'reports' ? 'Reports' : 'Scripts'}
            <span className="ml-1.5 text-xs text-gray-400">
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
      <div className="space-y-3">
        {activeTab === 'reports' ? (
          filteredReports.length === 0 ? (
            <EmptyState type="reports" />
          ) : (
            filteredReports.map((report) => (
              <Card
                key={report.id}
                onClick={() => setSelectedItem(report)}
                className="cursor-pointer hover:border-gray-300"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                        {report.researchType}
                      </span>
                      <h3 className="font-medium text-gray-900">{report.title}</h3>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                      {report.summary}
                    </p>
                  </div>
                  <span className="ml-4 shrink-0 text-xs text-gray-400">
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
              className="cursor-pointer hover:border-gray-300"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{script.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                    {script.content}
                  </p>
                  <div className="mt-2 flex gap-2">
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                      {script.platform}
                    </span>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                      {script.status}
                    </span>
                  </div>
                </div>
                <span className="ml-4 shrink-0 text-xs text-gray-400">
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
            className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedItem.title}
                </h2>
                {isReport(selectedItem) && (
                  <p className="mt-1 text-sm text-gray-500">
                    {selectedItem.researchType} · {getReportSubject(selectedItem)}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {isReport(selectedItem) ? (
              // Report detail
              <div className="space-y-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">Summary</span>
                  <p className="mt-1 text-gray-900">{selectedItem.summary}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Content</span>
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
                    <span className="text-sm font-medium text-gray-500">Sources</span>
                    <ul className="mt-1 list-inside list-disc text-sm text-gray-600">
                      {selectedItem.sources.map((source, i) => (
                        <li key={i}>{source}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              // Script detail
              <div className="space-y-4">
                <div className="flex gap-2">
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                    {selectedItem.platform}
                  </span>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                    {selectedItem.status}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Prompt</span>
                  <p className="mt-1 text-gray-900">{selectedItem.prompt}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Script</span>
                  <pre className="mt-2 whitespace-pre-wrap rounded-lg bg-gray-50 p-4 text-sm text-gray-900">
                    {selectedItem.content}
                  </pre>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(selectedItem.content)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
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
                className="rounded-lg px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
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
    <div className="rounded-lg border border-dashed border-gray-300 py-12 text-center">
      <p className="text-gray-500">
        No {type} yet.{' '}
        {type === 'reports'
          ? 'Start by creating a research report.'
          : 'Generate a script from your reports.'}
      </p>
    </div>
  )
}
