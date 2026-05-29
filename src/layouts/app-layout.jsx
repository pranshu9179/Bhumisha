import { Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { AppSidebar } from '@/components/app-shell/app-sidebar'
import { Topbar } from '@/components/app-shell/topbar'
import { cn } from '@/lib/utils'

export function AppLayout({ role }) {
  const sidebarExpanded = useSelector((state) => state.ui.sidebarOpen)

  return (
    <div className="min-h-screen">
      <AppSidebar role={role} />
      <div className={cn('min-h-screen transition-all duration-300 md:ml-24', sidebarExpanded ? 'md:ml-80' : 'md:ml-24')}>
        <Topbar role={role} />
        <main className="px-4 py-6 md:px-8 md:py-8">
          <div className="mx-auto max-w-[1440px] space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
