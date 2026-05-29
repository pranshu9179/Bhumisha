import { Outlet } from 'react-router-dom'
import { APP_NAME } from '@/lib/constants'

export function AuthLayout() {
  return (
    <div className="field-grid relative min-h-screen overflow-hidden bg-[linear-gradient(135deg,#10291d_0%,#163625_35%,#f8fafc_100%)] px-4 py-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.18),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.12),transparent_30%)]" />
      <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-[1440px] items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="hidden space-y-8 px-8 text-white lg:block">
          <div className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.22em] text-emerald-100">
            Agriculture Advisory SaaS
          </div>
          <div className="space-y-4">
            <h1 className="max-w-xl text-5xl font-semibold leading-tight tracking-tight">
              Advisory, escalation, and marketplace operations in one control layer.
            </h1>
            <p className="max-w-xl text-lg leading-8 text-emerald-50/85">
              {APP_NAME} helps experts, employees, vendors, and admins coordinate field intelligence and commerce workflows through a secure role-based experience.
            </p>
          </div>
          <div className="grid max-w-2xl grid-cols-2 gap-4">
            {[
              'Role-based command center',
              'Expert recommendation workflows',
              'Vendor marketplace operations',
              'Audit-ready escalation tracking',
            ].map((item) => (
              <div key={item} className="rounded-3xl border border-white/10 bg-white/8 p-5 backdrop-blur-sm">
                <p className="text-sm font-medium text-emerald-50">{item}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="relative mx-auto w-full max-w-xl">
          <Outlet />
        </section>
      </div>
    </div>
  )
}
