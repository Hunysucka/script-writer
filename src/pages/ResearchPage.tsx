import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useAppContext } from '@/hooks'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { MarkdownEditor } from '@/components/ui/MarkdownEditor'
import { SkeletonCard } from '@/components/ui/Skeleton'
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
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [focusTopics, setFocusTopics] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setIsInitialLoad(false), 300)
    return () => clearTimeout(timer)
  }, [])

  const handleStartResearch = async () => {
    const input = {
      type: researchType,
      bookTitle: researchType === 'book' ? bookTitle : undefined,
      authorName: researchType === 'book' || researchType === 'author' ? authorName : undefined,
      topic: researchType === 'topic' ? topic : undefined,
      focusTopics: researchType === 'author' && focusTopics.trim()
        ? focusTopics.split(',').map(t => t.trim()).filter(Boolean)
        : undefined,
    }

    // Validate input
    if (researchType === 'book' && !bookTitle.trim()) return
    if (researchType === 'author' && !authorName.trim()) return
    if (researchType === 'topic' && !topic.trim()) return

    try {
      const job = await agentService.startResearch(input)
      dispatch({ type: 'SET_ACTIVE_JOB', payload: job })

      // Poll for progress every 2 seconds
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
            toast.error(status.error || 'Research failed. Please try again.')
          }
          dispatch({ type: 'SET_ACTIVE_JOB', payload: null })
          // Clear form
          setBookTitle('')
          setAuthorName('')
          setTopic('')
          setFocusTopics('')
        }
      }, 2000)
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

  const getProgressStage = (progress: number, type: ResearchType): string => {
    if (type === 'book') {
      if (progress < 30) return 'Analyzing book structure and thesis...'
      if (progress < 50) return 'Extracting key concepts and arguments...'
      if (progress < 80) return 'Compiling quotes and critical assessment...'
      return 'Finalizing report...'
    }
    if (type === 'author') {
      if (progress < 15) return 'Searching web for author information...'
      if (progress < 30) return 'Finding interviews and talks on YouTube...'
      if (progress < 45) return 'Fetching video transcripts...'
      if (progress < 60) return 'Analyzing perspectives and quotes...'
      if (progress < 85) return 'Synthesizing intellectual profile...'
      return 'Finalizing report...'
    }
    // topic
    if (progress < 15) return 'Searching authoritative sources...'
    if (progress < 40) return 'Gathering information from experts...'
    if (progress < 60) return 'Analyzing key concepts...'
    if (progress < 85) return 'Synthesizing comprehensive primer...'
    return 'Finalizing report...'
  }

  // If viewing a report, show the editor
  if (viewingReport) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => setViewingReport(null)}
            className="flex min-h-[44px] items-center gap-2 text-base text-accent-600 transition-colors hover:text-accent-800 dark:text-accent-400 dark:hover:text-accent-200 sm:min-h-0 sm:text-sm"
          >
            <svg className="h-5 w-5 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Research
          </button>
          <div className="flex gap-3 sm:gap-2">
            <Button variant="secondary" onClick={handleCopyContent}>
              Copy
            </Button>
            <Button onClick={handleSaveReport}>Save Changes</Button>
          </div>
        </div>

        <div>
          <h1 className="font-serif text-3xl font-semibold text-ink dark:text-ink-light sm:text-2xl">{viewingReport.title}</h1>
          <p className="mt-2 text-base italic text-accent-500 dark:text-accent-400 sm:text-sm">
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
            <h3 className="mb-3 font-serif text-lg font-medium text-accent-700 dark:text-accent-300 sm:mb-2 sm:text-base">Sources</h3>
            <ul className="space-y-2 text-base leading-relaxed text-accent-600 dark:text-accent-400 sm:space-y-1 sm:text-sm">
              {viewingReport.sources.map((source, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-accent-400">•</span>
                  <span>{source}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-ink dark:text-accent-400 sm:text-2xl">Research Agent</h1>
        <p className="mt-3 text-lg leading-relaxed text-accent-600 dark:text-accent-400 sm:mt-2 sm:text-base">
          Research a book, author, or topic. The agent will create a detailed markdown report.
        </p>
      </div>

      <Card>
        <div className="space-y-6 sm:space-y-5">
          {/* Research Type Selector */}
          <div>
            <label className="mb-3 block font-serif text-base font-medium text-accent-700 dark:text-accent-300 sm:mb-2 sm:text-sm">
              What would you like to research?
            </label>
            <div className="flex flex-wrap gap-3 sm:gap-2">
              {(['book', 'author', 'topic'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setResearchType(type)}
                  disabled={isResearching}
                  className={`min-h-[44px] rounded-md px-5 py-3 text-base font-medium transition-all duration-200 sm:min-h-0 sm:px-4 sm:py-2 sm:text-sm ${
                    researchType === type
                      ? 'bg-accent-500 text-white shadow-sm'
                      : 'border border-accent-200 bg-white text-accent-700 hover:bg-accent-50 dark:border-accent-700 dark:bg-transparent dark:text-accent-300 dark:hover:bg-accent-900/30'
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
            <div className="space-y-3">
              <Input
                label="Author Name"
                placeholder="e.g., Ludwig von Mises"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                disabled={isResearching}
              />
              <Input
                label="Focus Topics (optional)"
                placeholder="e.g., inflation, monetary policy, free markets"
                value={focusTopics}
                onChange={(e) => setFocusTopics(e.target.value)}
                disabled={isResearching}
              />
              <p className="text-sm text-accent-500 dark:text-accent-500">
                Comma-separated topics to focus the research on specific areas
              </p>
            </div>
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
          <div className="space-y-4">
            <div className="flex items-center justify-between text-base sm:text-sm">
              <span className="font-serif italic text-accent-600 dark:text-accent-400">Researching: {getResearchLabel()}</span>
              <span className="font-medium text-accent-700 dark:text-accent-300">{activeJob.progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-accent-100 dark:bg-accent-800">
              <div
                className="h-full rounded-full bg-accent-500 transition-all duration-500"
                style={{ width: `${activeJob.progress}%` }}
              />
            </div>
            <p className="text-sm italic text-accent-500 dark:text-accent-500 sm:text-xs">
              {getProgressStage(activeJob.progress, researchType)}
            </p>
          </div>
        </Card>
      )}

      {/* Recent Reports */}
      {(isInitialLoad || state.reports.length > 0) && (
        <div className="space-y-5">
          <h2 className="font-serif text-2xl font-semibold text-ink dark:text-ink-light sm:text-xl">Recent Reports</h2>
          {isInitialLoad ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : (
            state.reports.slice(0, 5).map((report) => (
              <Card
                key={report.id}
                onClick={() => handleViewReport(report)}
                className="cursor-pointer transition-all duration-200 hover:border-accent-300 hover:shadow-md dark:hover:border-accent-600"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 sm:gap-2">
                      <span className="rounded-full bg-accent-100 px-3 py-1 text-sm font-medium text-accent-700 dark:bg-accent-800 dark:text-accent-300 sm:px-2 sm:py-0.5 sm:text-xs">
                        {report.researchType}
                      </span>
                      <h3 className="font-serif text-lg font-medium text-ink dark:text-ink-light sm:text-base">{report.title}</h3>
                    </div>
                    <p className="mt-2 line-clamp-2 text-base leading-relaxed text-accent-600 dark:text-accent-400 sm:mt-1 sm:text-sm">{report.summary}</p>
                  </div>
                  <span className="shrink-0 text-sm text-accent-400 dark:text-accent-500 sm:ml-4 sm:text-xs">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}
