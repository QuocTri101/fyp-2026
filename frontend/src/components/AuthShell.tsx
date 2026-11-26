import type { ReactNode } from 'react'

interface AuthShellProps {
  title: string
  subtitle: string
  children: ReactNode
  footer: ReactNode
}

/** Shared frame for the login and register pages. */
export default function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="mx-auto grid max-w-4xl overflow-hidden rounded-2xl border border-line bg-white md:grid-cols-5">
      <aside className="hidden flex-col justify-between bg-ink text-white md:col-span-2 md:flex">
        <div className="p-8">
          <p className="font-display text-4xl font-semibold leading-[0.95]">
            Order a service and follow it from one place.
          </p>
          <p className="mt-4 text-white/70">
            Your orders stay under your account, so you can edit or cancel them any time.
          </p>
        </div>
        <div className="hazard h-3" aria-hidden />
      </aside>

      <div className="p-6 sm:p-10 md:col-span-3">
        <h1 className="text-4xl">{title}</h1>
        <p className="mt-1 text-steel">{subtitle}</p>
        <div className="mt-6">{children}</div>
        <p className="mt-6 text-sm text-steel">{footer}</p>
      </div>
    </div>
  )
}
