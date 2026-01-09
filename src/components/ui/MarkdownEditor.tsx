import { useState } from 'react'
import { clsx } from 'clsx'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  readOnly?: boolean
  className?: string
}

export function MarkdownEditor({
  value,
  onChange,
  readOnly = false,
  className,
}: MarkdownEditorProps) {
  const [mode, setMode] = useState<'edit' | 'preview'>('preview')

  // Simple markdown to HTML converter for preview
  const renderMarkdown = (md: string): string => {
    return md
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-6 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-8 mb-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Blockquotes
      .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-gray-300 pl-4 my-4 italic text-gray-600">$1</blockquote>')
      // Unordered lists
      .replace(/^- (.*$)/gim, '<li class="ml-4">$1</li>')
      // Ordered lists
      .replace(/^\d+\. (.*$)/gim, '<li class="ml-4 list-decimal">$1</li>')
      // Tables (basic)
      .replace(/\|(.+)\|/g, (match) => {
        const cells = match.split('|').filter(Boolean)
        if (cells.every(c => c.trim().match(/^-+$/))) {
          return '' // Skip separator row
        }
        const cellHtml = cells.map(c => `<td class="border border-gray-200 px-3 py-2">${c.trim()}</td>`).join('')
        return `<tr>${cellHtml}</tr>`
      })
      // Code blocks
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-100 rounded-lg p-4 my-4 overflow-x-auto text-sm"><code>$1</code></pre>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1.5 py-0.5 rounded text-sm">$1</code>')
      // Paragraphs
      .replace(/\n\n/g, '</p><p class="my-3">')
      // Line breaks
      .replace(/\n/g, '<br />')
  }

  return (
    <div className={clsx('rounded-lg border border-gray-200', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-3 py-2">
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setMode('preview')}
            className={clsx(
              'rounded px-3 py-1 text-sm font-medium transition-colors',
              mode === 'preview'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            Preview
          </button>
          {!readOnly && (
            <button
              type="button"
              onClick={() => setMode('edit')}
              className={clsx(
                'rounded px-3 py-1 text-sm font-medium transition-colors',
                mode === 'edit'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              Edit
            </button>
          )}
        </div>
        {mode === 'edit' && (
          <span className="text-xs text-gray-400">Markdown supported</span>
        )}
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {mode === 'edit' ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-full min-h-[400px] w-full resize-none p-4 font-mono text-sm focus:outline-none"
            placeholder="Write your markdown here..."
          />
        ) : (
          <div
            className="prose prose-sm max-w-none p-4"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }}
          />
        )}
      </div>
    </div>
  )
}
