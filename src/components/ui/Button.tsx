import { clsx } from 'clsx'
import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
  loading?: boolean
}

export function Button({
  children,
  variant = 'primary',
  loading = false,
  disabled,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={clsx(
        'inline-flex min-h-[44px] items-center justify-center rounded-md px-5 py-3 text-base font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-[40px] sm:px-4 sm:py-2.5 sm:text-sm',
        variant === 'primary' && 'bg-accent-500 text-white hover:bg-accent-600 dark:bg-accent-600 dark:hover:bg-accent-500',
        variant === 'secondary' && 'border border-accent-300 bg-white text-accent-700 hover:bg-accent-50 dark:border-accent-700 dark:bg-transparent dark:text-accent-200 dark:hover:bg-accent-900/30',
        className
      )}
      {...props}
    >
      {loading && (
        <svg
          className="-ml-1 mr-2 h-4 w-4 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  )
}
