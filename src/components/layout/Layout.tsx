import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { BottomNav } from './BottomNav'

export function Layout() {
  return (
    <div className="min-h-screen bg-paper dark:bg-paper-dark">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-6 pb-24 sm:py-8 sm:pb-8">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
