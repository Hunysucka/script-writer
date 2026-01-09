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
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white sm:text-xl">Script Writer</h1>
        <p className="mt-2 text-base text-gray-600 dark:text-gray-400 sm:mt-1 sm:text-sm">
          Select research reports and generate a script for your video.
        </p>
      </div>

      {/* Report Selection */}
      <Card>
        <h2 className="mb-4 text-base font-medium text-gray-900 dark:text-white sm:mb-3 sm:text-sm">Select Reports</h2>
        {state.reports.length === 0 ? (
          <p className="text-base text-gray-500 dark:text-gray-400 sm:text-sm">
            No reports yet. Create one in the Research tab first.
          </p>
        ) : (
          <div className="space-y-3 sm:space-y-2">
            {state.reports.map((report: ResearchReport) => (
              <label
                key={report.id}
                className="flex min-h-[56px] cursor-pointer items-center gap-4 rounded-lg border border-gray-200 p-4 active:bg-gray-50 dark:border-gray-600 dark:active:bg-gray-700 sm:min-h-0 sm:gap-3 sm:p-3 sm:hover:bg-gray-50 dark:sm:hover:bg-gray-700"
              >
                <input
                  type="checkbox"
                  checked={selectedReportIds.includes(report.id)}
                  onChange={() => handleToggleReport(report.id)}
                  className="h-5 w-5 rounded border-gray-300 text-blue-600 dark:border-gray-500 dark:bg-gray-700 sm:h-4 sm:w-4"
                />
                <div className="flex-1">
                  <p className="text-base font-medium text-gray-900 dark:text-white sm:text-sm">{report.title}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 sm:text-xs">{report.topic}</p>
                </div>
              </label>
            ))}
          </div>
        )}
      </Card>

      {/* Prompt & Platform */}
      <Card>
        <div className="space-y-5 sm:space-y-4">
          <div>
            <label className="mb-2 block text-base font-medium text-gray-700 dark:text-gray-300 sm:mb-1.5 sm:text-sm">
              Script Prompt
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the style and tone you want for the script..."
              rows={4}
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 sm:px-3 sm:py-2 sm:text-sm"
            />
          </div>

          <div>
            <label className="mb-2 block text-base font-medium text-gray-700 dark:text-gray-300 sm:mb-1.5 sm:text-sm">
              Platform
            </label>
            <div className="flex flex-wrap gap-2">
              {(['youtube', 'instagram', 'both'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPlatform(p)}
                  className={`min-h-[44px] rounded-lg px-5 py-3 text-base font-medium transition-colors sm:min-h-0 sm:px-4 sm:py-2 sm:text-sm ${
                    platform === p
                      ? 'bg-blue-600 text-white dark:bg-blue-500'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
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
          <div className="space-y-5 sm:space-y-4">
            <input
              type="text"
              value={generatedScript.title}
              onChange={(e) =>
                setGeneratedScript({ ...generatedScript, title: e.target.value })
              }
              className="w-full border-b border-gray-200 bg-transparent pb-3 text-xl font-medium text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:text-white sm:pb-2 sm:text-lg"
            />
            <textarea
              value={generatedScript.content}
              onChange={(e) =>
                setGeneratedScript({ ...generatedScript, content: e.target.value })
              }
              rows={12}
              className="w-full rounded-lg border border-gray-200 bg-white p-4 text-base focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:p-3 sm:text-sm"
            />
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-2">
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
