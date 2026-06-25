import { Outlet } from 'react-router-dom'
import { Sprout } from 'lucide-react'
import { APP_NAME } from '@/lib/constants'

export function AuthLayout() {
  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-2">
      <section className="hidden min-h-screen bg-[linear-gradient(145deg,#0f2f24_0%,#174d35_54%,#2f7d4a_100%)] px-12 py-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/12 text-amber-300 ring-1 ring-white/12">
            <Sprout className="h-7 w-7" />
          </div>
          <p className="text-2xl font-semibold">{APP_NAME}</p>
        </div>

        <div className="max-w-lg">
          <div className="mb-6 h-1.5 w-20 rounded-full bg-amber-300" />
          <p className="text-6xl font-semibold leading-tight">Bhumisha Expert</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {['Admin Panel', 'Crop Catalog', 'Vendor Tools', 'Expert Desk'].map((item) => (
            <div key={item} className="rounded-xl border border-white/12 bg-white/10 px-4 py-3">
              <p className="text-sm font-semibold text-emerald-50">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center bg-[#f8faf7] px-5 py-8 sm:px-8">
        <div className="w-full max-w-[430px]">
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#174d35] text-amber-300">
              <Sprout className="h-6 w-6" />
            </div>
            <p className="text-xl font-semibold text-dark">{APP_NAME}</p>
          </div>
          <Outlet />
        </div>
      </section>
    </div>
  )
}
