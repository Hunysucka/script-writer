import { clsx } from 'clsx'
import type { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div
      className={clsx(
        'border-2 border-gray-900 bg-white p-5 dark:border-gray-600 dark:bg-gray-800 sm:p-4',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
