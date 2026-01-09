import { useState } from 'react'
import { useAppContext } from '@/hooks'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { agentService } from '@/services/agentService'

export function ResearchPage() {
  const { state, dispatch } = useAppContext()
  const [topic, setTopic] = useState('')

  const handleStartResearch = async () => {
    if (!topic.trim()) return

    try {
      const job = await agentService.startResearch(topic)
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
            dispatch({
              type: 'ADD_REPORT',
              payload: status.result as import('@/types').ResearchReport,
            })
          }
          dispatch({ type: 'SET_ACTIVE_JOB', payload: null })
        }
      }, 500)
    } catch {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to start research' })
    }
  }

  const activeJob = state.activeJob
  const isResearching = activeJob?.type === 'research' && activeJob.status === 'running'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Research Agent</h1>
        <p className="mt-1 text-gray-600">
          Enter a topic to research. The AI agent will gather information and create a report.
        </p>
      </div>

      <Card>
        <div className="space-y-4">
          <Input
            label="Research Topic"
            placeholder="e.g., Latest trends in sustainable fashion"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={isResearching}
          />
          <Button
            onClick={handleStartResearch}
            disabled={!topic.trim() || isResearching}
            loading={isResearching}
          >
            {isResearching ? 'Researching...' : 'Start Research'}
          </Button>
        </div>
      </Card>

      {isResearching && activeJob && (
        <Card>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Researching: {topic}</span>
              <span className="font-medium text-gray-900">{activeJob.progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${activeJob.progress}%` }}
              />
            </div>
          </div>
        </Card>
      )}

      {state.reports.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-gray-900">Recent Reports</h2>
          {state.reports.slice(0, 3).map((report) => (
            <Card key={report.id}>
              <h3 className="font-medium text-gray-900">{report.title}</h3>
              <p className="mt-1 text-sm text-gray-600">{report.summary}</p>
              <p className="mt-2 text-xs text-gray-400">
                {new Date(report.createdAt).toLocaleDateString()}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
