import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { clsx } from 'clsx'
import { useTheme } from '@/hooks/useTheme'

const navItems = [
  { path: '/', label: 'Research' },
  { path: '/write', label: 'Write' },
  { path: '/catalog', label: 'Catalog' },
]

export function Header() {
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="sticky top-0 z-50 border-b border-accent-200 bg-paper/95 backdrop-blur-sm dark:border-accent-800 dark:bg-paper-dark/95">
      <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:h-14">
        <Link to="/" className="font-serif text-2xl font-semibold italic text-accent-700 dark:text-accent-300 sm:text-xl">
          ScriptWriter
        </Link>

        {/* Desktop nav */}
        <nav className="hidden gap-1 sm:flex">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={clsx(
                'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                location.pathname === item.path
                  ? 'bg-accent-100 text-accent-700 dark:bg-accent-800 dark:text-accent-200'
                  : 'text-accent-600 hover:bg-accent-50 hover:text-accent-700 dark:text-accent-400 dark:hover:bg-accent-900/50 dark:hover:text-accent-300'
              )}
            >
              {item.label}
            </Link>
          ))}
          <button
            type="button"
            onClick={toggleTheme}
            className="ml-2 rounded-md p-2 text-accent-500 hover:bg-accent-50 dark:text-accent-400 dark:hover:bg-accent-900/50"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </nav>

        {/* Mobile buttons */}
        <div className="flex items-center gap-1 sm:hidden">
          <button
            type="button"
            onClick={toggleTheme}
            className="min-h-[44px] min-w-[44px] rounded-md p-2 text-accent-500 hover:bg-accent-50 dark:text-accent-400 dark:hover:bg-accent-900/50"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="min-h-[44px] min-w-[44px] rounded-md p-2 text-accent-500 hover:bg-accent-50 dark:text-accent-400 dark:hover:bg-accent-900/50"
            aria-label="Toggle menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileMenuOpen && (
        <nav className="border-t border-accent-200 px-4 py-3 dark:border-accent-800 sm:hidden">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={clsx(
                'block min-h-[48px] rounded-md px-4 py-3 text-base font-medium transition-colors',
                location.pathname === item.path
                  ? 'bg-accent-100 text-accent-700 dark:bg-accent-800 dark:text-accent-200'
                  : 'text-accent-600 hover:bg-accent-50 dark:text-accent-400 dark:hover:bg-accent-900/50'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  )
}
