import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { NavLink } from 'react-router-dom'
import { navigationByRole } from '@/config/navigation'
import { APP_NAME } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { setMobileSidebarOpen, toggleSidebar } from '@/store/ui-slice'
import { useOrders } from '@/services/api/hooks'

export function AppSidebar({ role }) {
  const dispatch = useDispatch()
  const { sidebarOpen, mobileSidebarOpen } = useSelector((state) => state.ui)
  const sections = navigationByRole[role] || []
  const [openGroups, setOpenGroups] = useState({})
  
  // Only fetch orders if we're dealing with admin to prevent unwanted requests
  const { data: orders = [] } = useOrders({ limit: 1000 })
  const orderCounts = {
    total: orders.length,
    pending: orders.filter(o => ['pending', 'processing'].includes(String(o.orderStatus || o.order_status || o.fulfillmentStatus || '').toLowerCase())).length,
    dispatched: orders.filter(o => ['dispatched', 'shipped'].includes(String(o.orderStatus || o.order_status || o.fulfillmentStatus || '').toLowerCase())).length,
    delivered: orders.filter(o => String(o.orderStatus || o.order_status || o.fulfillmentStatus || '').toLowerCase() === 'delivered').length,
  }

  const toggleGroup = (title) => setOpenGroups(prev => ({ ...prev, [title]: !prev[title] }))

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
<div className="relative mb-6 flex items-center justify-center">
  {sidebarOpen && (
    <div className="text-center">
      <p className="text-2xl font-semibold">{APP_NAME}</p>
      <p className="text-xs uppercase tracking-[0.18em] text-emerald-50/65"></p>
    </div>
  )}

  <button
    type="button"
    onClick={() => dispatch(toggleSidebar())}
    className="absolute right-0 hidden rounded-full border border-white/10 p-2 text-emerald-50/75 transition hover:bg-white/10 md:block"
  >
    {sidebarOpen ? (
      <ChevronLeft className="h-4 w-4" />
    ) : (
      <ChevronRight className="h-4 w-4" />
    )}
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
                  
                  if (item.subItems) {
                    return (
                      <div key={item.title}>
                        <button
                          onClick={() => toggleGroup(item.title)}
                          className={cn(
                            'group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-emerald-50/72 transition hover:bg-white/8 hover:text-white',
                            !sidebarOpen ? 'justify-center px-2' : '',
                          )}
                        >
                          <Icon className="h-5 w-5 shrink-0" />
                          {sidebarOpen ? (
                            <>
                              <div className="flex-1 min-w-0 text-left">
                                <p className="truncate text-xs font-semibold">{item.title}</p>
                              </div>
                              <ChevronRight className={cn("h-4 w-4 transition-transform", openGroups[item.title] && "rotate-90")} />
                            </>
                          ) : null}
                        </button>
                        {sidebarOpen && openGroups[item.title] && (
                          <div className="mt-1 space-y-1 pl-10 pr-2 pb-2">
                            {item.subItems.map((subItem) => {
                              let count = null
                              if (subItem.id === 'orders_total') count = orderCounts.total
                              if (subItem.id === 'orders_pending') count = orderCounts.pending
                              if (subItem.id === 'orders_dispatched') count = orderCounts.dispatched
                              if (subItem.id === 'orders_delivered') count = orderCounts.delivered

                              return (
                                <NavLink
                                  key={subItem.title}
                                  to={subItem.path}
                                  onClick={() => dispatch(setMobileSidebarOpen(false))}
                                  className={({ isActive }) =>
                                    cn(
                                      'flex items-center justify-between rounded-lg px-3 py-2 text-sm text-emerald-50/60 transition hover:bg-white/8 hover:text-white',
                                      isActive ? 'bg-emerald-50/12 text-white font-medium' : ''
                                    )
                                  }
                                >
                                  <span className="truncate">{subItem.title}</span>
                                  {count !== null && (
                                    <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-100">{count}</span>
                                  )}
                                </NavLink>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  }

                  return (
                    <NavLink
                      key={item.path || item.title}
                      to={item.path}
                      title={!sidebarOpen ? item.title : undefined}
                      aria-label={item.title}
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
                          <p className="truncate text-xs font-semibold">{item.title}</p>
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
