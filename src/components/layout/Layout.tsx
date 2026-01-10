import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Header } from './Header'
import { BottomNav } from './BottomNav'
import { motion, AnimatePresence } from 'framer-motion'
import { useSwipeable } from 'react-use-gesture'

const pages = ['/', '/write', '/catalog']

export function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const currentIndex = pages.indexOf(location.pathname)

  const bind = useSwipeable({
    onSwipedLeft: () => {
      if (currentIndex < pages.length - 1) {
        navigate(pages[currentIndex + 1])
      }
    },
    onSwipedRight: () => {
      if (currentIndex > 0) {
        navigate(pages[currentIndex - 1])
      }
    },
    trackMouse: false,
  })

  return (
    <div className="min-h-screen bg-paper dark:bg-paper-dark" {...bind()}>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-6 pb-24 sm:py-8 sm:pb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <div className="fixed bottom-20 left-0 right-0 z-40 flex justify-center gap-2 sm:hidden">
        {pages.map((_, i) => (
          <div
            key={i}
            className={`h-2 w-2 rounded-full transition-all duration-300 ${
              i === currentIndex
                ? 'bg-accent-500 w-4'
                : 'bg-accent-200 dark:bg-accent-800'
            }`}
          />
        ))}
      </div>
      <BottomNav />
    </div>
  )
}
