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
          className="mb-2 block text-base font-medium text-gray-700 dark:text-gray-300 sm:mb-1.5 sm:text-sm"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={clsx(
          'w-full border-2 border-gray-900 bg-white px-4 py-3 text-base placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 dark:border-gray-500 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-primary-500 dark:disabled:bg-gray-700 sm:px-3 sm:py-2.5 sm:text-sm',
          className
        )}
        {...props}
      />
    </div>
  )
}
