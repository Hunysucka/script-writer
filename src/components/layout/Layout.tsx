import { Outlet } from 'react-router-dom'
import { Header } from './Header'

export function Layout() {
  return (
    <div className="min-h-screen bg-paper dark:bg-paper-dark">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8 pb-safe sm:py-8">
        <Outlet />
      </main>
    </div>
  )
}
