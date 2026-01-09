import { useState } from 'react'
import { useAppContext } from '@/hooks'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { MarkdownEditor } from '@/components/ui/MarkdownEditor'
import { agentService } from '@/services/agentService'
import type { ResearchType, ResearchReport } from '@/types'

export function ResearchPage() {
  const { state, dispatch } = useAppContext()
  const [researchType, setResearchType] = useState<ResearchType>('book')
  const [bookTitle, setBookTitle] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [topic, setTopic] = useState('')
  const [viewingReport, setViewingReport] = useState<ResearchReport | null>(null)
  const [editedContent, setEditedContent] = useState('')

  const handleStartResearch = async () => {
    const input = {
      type: researchType,
      bookTitle: researchType === 'book' ? bookTitle : undefined,
      authorName: researchType === 'book' || researchType === 'author' ? authorName : undefined,
      topic: researchType === 'topic' ? topic : undefined,
    }

    // Validate input
    if (researchType === 'book' && !bookTitle.trim()) return
    if (researchType === 'author' && !authorName.trim()) return
    if (researchType === 'topic' && !topic.trim()) return

    try {
      const job = await agentService.startResearch(input)
      dispatch({ type: 'SET_ACTIVE_JOB', payload: job })

      // Poll for progress
      const pollInterval = setInterval(async () => {
        const status = await agentService.getJobStatus(job.id)
        dispatch({
          type: 'UPDATE_JOB_PROGRESS',
          payload: { progress: status.progress, status: status.status },
        })

        if (status.status === 'completed' || status.status === 'failed') {
          clearInterval(pollInterval)
          if (status.status === 'completed' && status.result) {
            const report = status.result as ResearchReport
            dispatch({ type: 'ADD_REPORT', payload: report })
            setViewingReport(report)
            setEditedContent(report.content)
          }
          dispatch({ type: 'SET_ACTIVE_JOB', payload: null })
          // Clear form
          setBookTitle('')
          setAuthorName('')
          setTopic('')
        }
      }, 500)
    } catch {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to start research' })
    }
  }

  const handleSaveReport = () => {
    if (!viewingReport) return
    const updated = {
      ...viewingReport,
      content: editedContent,
      updatedAt: new Date().toISOString(),
    }
    dispatch({ type: 'UPDATE_REPORT', payload: updated })
    setViewingReport(updated)
  }

  const handleViewReport = (report: ResearchReport) => {
    setViewingReport(report)
    setEditedContent(report.content)
  }

  const activeJob = state.activeJob
  const isResearching = activeJob?.type === 'research' && activeJob.status === 'running'

  const isFormValid = () => {
    if (researchType === 'book') return bookTitle.trim().length > 0
    if (researchType === 'author') return authorName.trim().length > 0
    if (researchType === 'topic') return topic.trim().length > 0
    return false
  }

  const getResearchLabel = () => {
    if (researchType === 'book') return bookTitle || 'book'
    if (researchType === 'author') return authorName || 'author'
    return topic || 'topic'
  }

  // If viewing a report, show the editor
  if (viewingReport) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => setViewingReport(null)}
            className="flex min-h-[44px] items-center gap-2 text-base font-semibold uppercase tracking-wide text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white sm:min-h-0 sm:text-sm"
          >
            <svg className="h-5 w-5 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Research
          </button>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => navigator.clipboard.writeText(editedContent)}>
              Copy
            </Button>
            <Button onClick={handleSaveReport}>Save Changes</Button>
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-2xl">{viewingReport.title}</h1>
          <p className="mt-1 text-base text-gray-500 dark:text-gray-400 sm:text-sm">
            {viewingReport.researchType === 'book' && viewingReport.bookTitle}
            {viewingReport.researchType === 'author' && viewingReport.authorName}
            {viewingReport.researchType === 'topic' && viewingReport.topic}
            {' · '}
            {new Date(viewingReport.updatedAt).toLocaleDateString()}
          </p>
        </div>

        <MarkdownEditor
          value={editedContent}
          onChange={setEditedContent}
        />

        {viewingReport.sources.length > 0 && (
          <Card>
            <h3 className="mb-2 text-base font-medium text-gray-700 dark:text-gray-300 sm:text-sm">Sources</h3>
            <ul className="space-y-2 text-base text-gray-600 dark:text-gray-400 sm:space-y-1 sm:text-sm">
              {viewingReport.sources.map((source, i) => (
                <li key={i}>• {source}</li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-2xl">Research Agent</h1>
        <p className="mt-2 text-base text-gray-600 dark:text-gray-400 sm:mt-1 sm:text-sm">
          Research a book, author, or topic. The agent will create a detailed markdown report.
        </p>
      </div>

      <Card>
        <div className="space-y-5 sm:space-y-4">
          {/* Research Type Selector */}
          <div>
            <label className="mb-2 block text-base font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300 sm:mb-1.5 sm:text-sm">
              Research Type
            </label>
            <div className="flex flex-wrap gap-2">
              {(['book', 'author', 'topic'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setResearchType(type)}
                  disabled={isResearching}
                  className={`min-h-[44px] px-5 py-3 text-base font-semibold uppercase tracking-wide transition-colors sm:min-h-0 sm:px-4 sm:py-2 sm:text-sm ${
                    researchType === type
                      ? 'bg-primary-500 text-white'
                      : 'border-2 border-gray-900 bg-white text-gray-900 hover:bg-gray-100 dark:border-gray-500 dark:bg-transparent dark:text-gray-200 dark:hover:bg-gray-700'
                  } disabled:opacity-50`}
                >
                  {type === 'book' ? 'Book' : type === 'author' ? 'Author' : 'Topic'}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Input Fields */}
          {researchType === 'book' && (
            <div className="space-y-3">
              <Input
                label="Book Title"
                placeholder="e.g., The Intelligent Investor"
                value={bookTitle}
                onChange={(e) => setBookTitle(e.target.value)}
                disabled={isResearching}
              />
              <Input
                label="Author (optional)"
                placeholder="e.g., Benjamin Graham"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                disabled={isResearching}
              />
            </div>
          )}

          {researchType === 'author' && (
            <Input
              label="Author Name"
              placeholder="e.g., Ludwig von Mises"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              disabled={isResearching}
            />
          )}

          {researchType === 'topic' && (
            <Input
              label="Topic or Concept"
              placeholder="e.g., Austrian economics"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={isResearching}
            />
          )}

          <Button
            onClick={handleStartResearch}
            disabled={!isFormValid() || isResearching}
            loading={isResearching}
          >
            {isResearching ? 'Researching...' : 'Start Research'}
          </Button>
        </div>
      </Card>

      {/* Progress Indicator */}
      {isResearching && activeJob && (
        <Card>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-base sm:text-sm">
              <span className="font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">Researching: {getResearchLabel()}</span>
              <span className="font-bold text-gray-900 dark:text-white">{activeJob.progress}%</span>
            </div>
            <div className="h-3 overflow-hidden bg-gray-200 dark:bg-gray-700 sm:h-2">
              <div
                className="h-full bg-primary-500 transition-all duration-300"
                style={{ width: `${activeJob.progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 sm:text-xs">
              Gathering information, analyzing sources, writing report...
            </p>
          </div>
        </Card>
      )}

      {/* Recent Reports */}
      {state.reports.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-xl">Recent Reports</h2>
          {state.reports.slice(0, 5).map((report) => (
            <Card
              key={report.id}
              onClick={() => handleViewReport(report)}
              className="cursor-pointer transition-colors hover:bg-gray-50 active:bg-gray-100 dark:hover:bg-gray-700 dark:active:bg-gray-600"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-primary-500 px-2.5 py-1 text-sm font-semibold uppercase text-white sm:px-2 sm:py-0.5 sm:text-xs">
                      {report.researchType}
                    </span>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white sm:text-sm">{report.title}</h3>
                  </div>
                  <p className="mt-2 line-clamp-2 text-base text-gray-600 dark:text-gray-400 sm:mt-1 sm:text-sm">{report.summary}</p>
                </div>
                <span className="shrink-0 text-sm font-medium text-gray-400 dark:text-gray-500 sm:ml-4 sm:text-xs">
                  {new Date(report.createdAt).toLocaleDateString()}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
