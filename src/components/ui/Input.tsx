import { clsx } from 'clsx'
import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export function Input({ label, className, id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div>
      {label && (
        <label
          htmlFor={inputId}
          className="mb-2 block font-serif text-base font-medium text-accent-700 dark:text-accent-300 sm:mb-1.5 sm:text-sm"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={clsx(
          'w-full rounded-md border border-accent-200 bg-white px-4 py-3 text-base transition-colors placeholder:text-accent-400 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20 disabled:cursor-not-allowed disabled:bg-accent-50 disabled:text-accent-400 dark:border-accent-700 dark:bg-paper-dark dark:text-ink-light dark:placeholder:text-accent-600 dark:focus:border-accent-500 dark:disabled:bg-accent-900 sm:px-3 sm:py-2.5 sm:text-sm',
          className
        )}
        {...props}
      />
    </div>
  )
}
