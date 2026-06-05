import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const PRIORITY_CONFIG = {
  URGENT: { label: 'Urgent', color: '#f43f5e', bg: 'rgba(244,63,94,0.15)' },
  HIGH:   { label: 'High',   color: '#f97316', bg: 'rgba(249,115,22,0.15)' },
  MEDIUM: { label: 'Medium', color: '#eab308', bg: 'rgba(234,179,8,0.15)' },
  LOW:    { label: 'Low',    color: '#22c55e', bg: 'rgba(34,197,94,0.15)' },
} as const

export function initials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
