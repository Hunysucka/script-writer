import { useState } from 'react'
import { toast } from 'sonner'
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
            toast.success('Research complete!')
          } else if (status.status === 'failed') {
            toast.error('Research failed. Please try again.')
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
      toast.error('Failed to start research')
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
    toast.success('Report saved')
  }

  const handleCopyContent = () => {
    navigator.clipboard.writeText(editedContent)
    toast.success('Copied to clipboard')
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
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setViewingReport(null)}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Research
          </button>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={handleCopyContent}>
              Copy
            </Button>
            <Button onClick={handleSaveReport}>Save Changes</Button>
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{viewingReport.title}</h1>
          <p className="mt-1 text-sm text-gray-500">
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
            <h3 className="mb-2 text-sm font-medium text-gray-700">Sources</h3>
            <ul className="space-y-1 text-sm text-gray-600">
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
        <h1 className="text-2xl font-semibold text-gray-900">Research Agent</h1>
        <p className="mt-1 text-gray-600">
          Research a book, author, or topic. The agent will create a detailed markdown report.
        </p>
      </div>

      <Card>
        <div className="space-y-4">
          {/* Research Type Selector */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Research Type
            </label>
            <div className="flex gap-2">
              {(['book', 'author', 'topic'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setResearchType(type)}
                  disabled={isResearching}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    researchType === type
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Researching: {getResearchLabel()}</span>
              <span className="font-medium text-gray-900">{activeJob.progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${activeJob.progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500">
              Gathering information, analyzing sources, writing report...
            </p>
          </div>
        </Card>
      )}

      {/* Recent Reports */}
      {state.reports.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-gray-900">Recent Reports</h2>
          {state.reports.slice(0, 5).map((report) => (
            <Card
              key={report.id}
              onClick={() => handleViewReport(report)}
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
                  <p className="mt-1 line-clamp-2 text-sm text-gray-600">{report.summary}</p>
                </div>
                <span className="ml-4 shrink-0 text-xs text-gray-400">
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
