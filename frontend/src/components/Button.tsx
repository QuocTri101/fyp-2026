import type { ButtonHTMLAttributes } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'destructive' | 'ghost' | 'onDark'
export type ButtonSize = 'md' | 'sm'

const base =
  'inline-flex items-center justify-center gap-2 rounded-md text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60'

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-signal text-ink hover:bg-signal-deep',
  secondary: 'border border-ink/25 bg-white text-ink hover:border-ink hover:bg-chrome',
  danger: 'border border-bad/40 bg-white text-bad hover:bg-bad/5',
  destructive: 'bg-bad text-white hover:bg-bad/90',
  ghost: 'text-ink hover:bg-chrome',
  onDark: 'border border-white/30 text-white hover:bg-white/10',
}

const sizes: Record<ButtonSize, string> = {
  md: 'px-4 py-2.5',
  sm: 'px-3 py-1.5',
}

/** Use on <Link> and <a> so links and buttons look identical. */
export function buttonClass(variant: ButtonVariant = 'primary', size: ButtonSize = 'md'): string {
  return `${base} ${variants[variant]} ${sizes[size]}`
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

export default function Button({
  variant = 'primary',
  size = 'md',
  type = 'button',
  className = '',
  ...props
}: ButtonProps) {
  return <button type={type} className={`${buttonClass(variant, size)} ${className}`.trim()} {...props} />
}
