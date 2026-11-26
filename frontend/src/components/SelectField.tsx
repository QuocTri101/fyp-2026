import type { SelectHTMLAttributes } from 'react'

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
}

export default function SelectField({ label, id, children, ...select }: SelectFieldProps) {
  const selectId = id ?? select.name
  return (
    <div>
      <label htmlFor={selectId} className="mb-1.5 block text-sm font-semibold">
        {label}
      </label>
      <select
        id={selectId}
        className="w-full rounded-md border border-line bg-white px-3 py-2.5 text-sm"
        {...select}
      >
        {children}
      </select>
    </div>
  )
}
