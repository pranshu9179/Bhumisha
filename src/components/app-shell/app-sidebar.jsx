import { ChevronLeft, ChevronRight, Sprout } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { NavLink } from 'react-router-dom'
import { navigationByRole } from '@/config/navigation'
import { APP_NAME } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { setMobileSidebarOpen, toggleSidebar } from '@/store/ui-slice'

export function AppSidebar({ role }) {
  const dispatch = useDispatch()
  const { sidebarOpen, mobileSidebarOpen } = useSelector((state) => state.ui)
  const sections = navigationByRole[role] || []

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-30 bg-slate-950/35 transition md:hidden',
          mobileSidebarOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={() => dispatch(setMobileSidebarOpen(false))}
      />
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-emerald-950/20 bg-[#14241f] px-4 py-5 text-white shadow-2xl shadow-slate-950/20 transition-all duration-300',
          sidebarOpen ? 'w-80' : 'w-24',
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        )}
      >
        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="rounded-xl bg-amber-400/15 p-3 text-amber-300 ring-1 ring-amber-200/15">
              <Sprout className="h-6 w-6" />
            </div>
            {sidebarOpen ? (
              <div className="min-w-0">
                <p className="truncate text-lg font-semibold">{APP_NAME}</p>
                <p className="text-xs uppercase tracking-[0.18em] text-emerald-50/65">Smart agriculture cloud</p>
              </div>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => dispatch(toggleSidebar())}
            className="hidden rounded-full border border-white/10 p-2 text-emerald-50/75 transition hover:bg-white/10 md:block"
          >
            {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto pr-1">
          {sections.map((section) => (
            <div key={section.group} className="space-y-2">
              {sidebarOpen ? (
                <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.26em] text-emerald-50/45">
                  {section.group}
                </p>
              ) : null}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => dispatch(setMobileSidebarOpen(false))}
                      className={({ isActive }) =>
                        cn(
                          'group flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-emerald-50/72 transition hover:bg-white/8 hover:text-white',
                          isActive ? 'bg-emerald-50/12 text-white shadow-lg shadow-slate-950/20 ring-1 ring-white/10' : '',
                          !sidebarOpen ? 'justify-center px-2' : '',
                        )
                      }
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      {sidebarOpen ? (
                        <div className="min-w-0">
                          <p className="truncate font-semibold">{item.title}</p>
                          <p className="truncate text-xs text-emerald-50/45 group-hover:text-emerald-50/70">
                            {item.description}
                          </p>
                        </div>
                      ) : null}
                    </NavLink>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </aside>
    </>
  )
}
