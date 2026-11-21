import type { InputHTMLAttributes } from 'react'

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  hint?: string
}

export default function FormField({ label, hint, id, className = '', ...input }: FormFieldProps) {
  const inputId = id ?? input.name
  return (
    <div>
      <label htmlFor={inputId} className="mb-1.5 block text-sm font-semibold">
        {label}
      </label>
      <input
        id={inputId}
        className={`w-full rounded-md border border-line bg-white px-3 py-2.5 text-sm placeholder:text-steel/60 ${className}`}
        {...input}
      />
      {hint && <p className="mt-1 text-xs text-steel">{hint}</p>}
    </div>
  )
}
