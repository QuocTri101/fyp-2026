import type { SelectHTMLAttributes } from 'react'

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
}

export default function SelectField({ label, id, children, ...select }: SelectFieldProps) {
  const selectId = id ?? select.name
  return (
    <div>
      <label htmlFor={selectId} className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <select
        id={selectId}
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
        {...select}
      >
        {children}
      </select>
    </div>
  )
}
