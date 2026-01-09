import { clsx } from 'clsx'
import type { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div
      className={clsx(
        'rounded-lg border border-accent-200 bg-white p-6 shadow-sm dark:border-accent-800 dark:bg-accent-900/20 sm:p-5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
