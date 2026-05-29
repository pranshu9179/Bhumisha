const credentials = [
  { role: 'Admin', email: 'admin@bhumisha.test', password: 'Admin@123' },
  { role: 'Expert', email: 'expert@bhumisha.test', password: 'Expert@123' },
  { role: 'Employee', email: 'employee@bhumisha.test', password: 'Employee@123' },
  { role: 'Vendor', email: 'vendor@bhumisha.test', password: 'Vendor@123' },
]

export function DemoCredentials() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {credentials.map((credential) => (
        <div key={credential.role} className="rounded-2xl border border-primary/10 bg-primary/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{credential.role}</p>
          <p className="mt-2 text-sm font-medium text-dark">{credential.email}</p>
          <p className="text-sm text-slate-500">{credential.password}</p>
        </div>
      ))}
    </div>
  )
}
