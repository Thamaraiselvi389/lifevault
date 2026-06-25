import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Toaster } from 'react-hot-toast'

export function AppLayout() {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <main className="min-h-screen lg:pl-64">
        <div className="mx-auto max-w-7xl px-4 py-8 pt-16 lg:px-8 lg:pt-8">
          <Outlet />
        </div>
      </main>
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'glass !bg-white/90 dark:!bg-slate-900/90 !text-slate-900 dark:!text-white',
        }}
      />
    </div>
  )
}
