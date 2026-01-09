import { useState } from 'react'
import { useAppContext } from '@/hooks'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { scriptService } from '@/services/scriptService'
import type { ScriptPlatform, ResearchReport, Script } from '@/types'

export function ScriptWriterPage() {
  const { state, dispatch } = useAppContext()
  const [selectedReportIds, setSelectedReportIds] = useState<string[]>([])
  const [prompt, setPrompt] = useState('')
  const [platform, setPlatform] = useState<ScriptPlatform>('youtube')
  const [generatedScript, setGeneratedScript] = useState<Script | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleToggleReport = (reportId: string) => {
    setSelectedReportIds((prev) =>
      prev.includes(reportId)
        ? prev.filter((id) => id !== reportId)
        : [...prev, reportId]
    )
  }

  const handleGenerate = async () => {
    if (selectedReportIds.length === 0 || !prompt.trim()) return

    setIsGenerating(true)
    try {
      const script = await scriptService.generateScript({
        reportIds: selectedReportIds,
        prompt,
        platform,
      })
      setGeneratedScript(script)
      dispatch({ type: 'ADD_SCRIPT', payload: script })
    } catch {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to generate script' })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveScript = async () => {
    if (!generatedScript) return
    const updated = { ...generatedScript, status: 'final' as const }
    await scriptService.updateScript(updated)
    dispatch({ type: 'UPDATE_SCRIPT', payload: updated })
    setGeneratedScript(null)
    setSelectedReportIds([])
    setPrompt('')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Script Writer</h1>
        <p className="mt-1 text-gray-600">
          Select research reports and generate a script for your video.
        </p>
      </div>

      {/* Report Selection */}
      <Card>
        <h2 className="mb-3 text-sm font-medium text-gray-900">Select Reports</h2>
        {state.reports.length === 0 ? (
          <p className="text-sm text-gray-500">
            No reports yet. Create one in the Research tab first.
          </p>
        ) : (
          <div className="space-y-2">
            {state.reports.map((report: ResearchReport) => (
              <label
                key={report.id}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={selectedReportIds.includes(report.id)}
                  onChange={() => handleToggleReport(report.id)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{report.title}</p>
                  <p className="text-xs text-gray-500">{report.topic}</p>
                </div>
              </label>
            ))}
          </div>
        )}
      </Card>

      {/* Prompt & Platform */}
      <Card>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Script Prompt
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the style and tone you want for the script..."
              rows={3}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Platform
            </label>
            <div className="flex gap-2">
              {(['youtube', 'instagram', 'both'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPlatform(p)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    platform === p
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {p === 'youtube' ? 'YouTube' : p === 'instagram' ? 'Instagram' : 'Both'}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={selectedReportIds.length === 0 || !prompt.trim() || isGenerating}
            loading={isGenerating}
          >
            {isGenerating ? 'Generating...' : 'Generate Script'}
          </Button>
        </div>
      </Card>

      {/* Generated Script */}
      {generatedScript && (
        <Card>
          <div className="space-y-4">
            <input
              type="text"
              value={generatedScript.title}
              onChange={(e) =>
                setGeneratedScript({ ...generatedScript, title: e.target.value })
              }
              className="w-full border-b border-gray-200 pb-2 text-lg font-medium text-gray-900 focus:border-blue-500 focus:outline-none"
            />
            <textarea
              value={generatedScript.content}
              onChange={(e) =>
                setGeneratedScript({ ...generatedScript, content: e.target.value })
              }
              rows={10}
              className="w-full rounded-lg border border-gray-200 p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <div className="flex gap-2">
              <Button onClick={handleSaveScript}>Save Script</Button>
              <Button
                variant="secondary"
                onClick={() => navigator.clipboard.writeText(generatedScript.content)}
              >
                Copy to Clipboard
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
