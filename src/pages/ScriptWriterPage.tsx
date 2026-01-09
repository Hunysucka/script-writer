import { useState } from 'react'
import { toast } from 'sonner'
import { useAppContext } from '@/hooks'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { scriptService } from '@/services/scriptService'
import type { ScriptPlatform, ResearchReport, Script } from '@/types'

function getReportSubtitle(report: ResearchReport): string {
  if (report.researchType === 'book') return report.bookTitle || ''
  if (report.researchType === 'author') return report.authorName || ''
  return report.topic || ''
}

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
      toast.success('Script generated!')
    } catch {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to generate script' })
      toast.error('Failed to generate script')
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
    toast.success('Script saved')
  }

  const handleCopyScript = () => {
    if (!generatedScript) return
    navigator.clipboard.writeText(generatedScript.content)
    toast.success('Copied to clipboard')
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-ink dark:text-accent-400 sm:text-2xl">Script Writer</h1>
        <p className="mt-3 text-lg leading-relaxed text-accent-600 dark:text-accent-400 sm:mt-2 sm:text-base">
          Select research reports and generate a script for your video.
        </p>
      </div>

      {/* Report Selection */}
      <Card>
        <h2 className="mb-4 font-serif text-xl font-medium text-ink dark:text-ink-light sm:mb-3 sm:text-lg">Select Reports</h2>
        {state.reports.length === 0 ? (
          <p className="text-base italic text-accent-500 dark:text-accent-400 sm:text-sm">
            No reports yet. Create one in the Research tab first.
          </p>
        ) : (
          <div className="space-y-3 sm:space-y-2">
            {state.reports.map((report: ResearchReport) => (
              <label
                key={report.id}
                className="flex min-h-[56px] cursor-pointer items-center gap-4 rounded-md border border-accent-200 p-4 transition-all duration-200 hover:border-accent-300 hover:bg-accent-50/50 dark:border-accent-700 dark:hover:border-accent-600 dark:hover:bg-accent-900/30 sm:min-h-0 sm:gap-3 sm:p-3"
              >
                <input
                  type="checkbox"
                  checked={selectedReportIds.includes(report.id)}
                  onChange={() => handleToggleReport(report.id)}
                  className="h-5 w-5 rounded border-accent-300 text-accent-500 focus:ring-accent-500 dark:border-accent-600 dark:bg-accent-900 sm:h-4 sm:w-4"
                />
                <div className="flex-1">
                  <p className="font-serif text-base font-medium text-ink dark:text-ink-light sm:text-sm">{report.title}</p>
                  <p className="text-sm text-accent-500 dark:text-accent-400 sm:text-xs">{getReportSubtitle(report)}</p>
                </div>
              </label>
            ))}
          </div>
        )}
      </Card>

      {/* Prompt & Platform */}
      <Card>
        <div className="space-y-6 sm:space-y-5">
          <div>
            <label className="mb-3 block font-serif text-base font-medium text-accent-700 dark:text-accent-300 sm:mb-2 sm:text-sm">
              Describe your script
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the style and tone you want for the script..."
              rows={4}
              className="w-full rounded-md border border-accent-200 bg-white px-4 py-3 text-base leading-relaxed transition-colors placeholder:text-accent-400 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20 dark:border-accent-700 dark:bg-paper-dark dark:text-ink-light dark:placeholder:text-accent-600 sm:px-3 sm:py-2 sm:text-sm"
            />
          </div>

          <div>
            <label className="mb-3 block font-serif text-base font-medium text-accent-700 dark:text-accent-300 sm:mb-2 sm:text-sm">
              Platform
            </label>
            <div className="flex flex-wrap gap-3 sm:gap-2">
              {(['youtube', 'instagram', 'both'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPlatform(p)}
                  className={`min-h-[44px] rounded-md px-5 py-3 text-base font-medium transition-all duration-200 sm:min-h-0 sm:px-4 sm:py-2 sm:text-sm ${
                    platform === p
                      ? 'bg-accent-500 text-white shadow-sm'
                      : 'border border-accent-200 bg-white text-accent-700 hover:bg-accent-50 dark:border-accent-700 dark:bg-transparent dark:text-accent-300 dark:hover:bg-accent-900/30'
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
          <div className="space-y-6 sm:space-y-5">
            <input
              type="text"
              value={generatedScript.title}
              onChange={(e) =>
                setGeneratedScript({ ...generatedScript, title: e.target.value })
              }
              className="w-full border-b border-accent-200 bg-transparent pb-3 font-serif text-2xl font-semibold text-ink focus:border-accent-500 focus:outline-none dark:border-accent-700 dark:text-ink-light sm:pb-2 sm:text-xl"
            />
            <textarea
              value={generatedScript.content}
              onChange={(e) =>
                setGeneratedScript({ ...generatedScript, content: e.target.value })
              }
              rows={14}
              className="w-full rounded-md border border-accent-200 bg-white p-5 text-base leading-relaxed focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20 dark:border-accent-700 dark:bg-paper-dark dark:text-ink-light sm:p-4 sm:text-sm"
            />
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-3">
              <Button onClick={handleSaveScript}>Save Script</Button>
              <Button variant="secondary" onClick={handleCopyScript}>
                Copy to Clipboard
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
