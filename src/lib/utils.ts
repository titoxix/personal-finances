import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Strip formatting from a typed amount string, keeping only digits (integer)
// or digits + one decimal point with up to 2 places (decimal).
export function parseAmountInput(value: string, decimal = false): string {
  if (!decimal) return value.replace(/\D/g, '')
  const stripped = value.replace(/[^\d.]/g, '')
  const dotIdx = stripped.indexOf('.')
  if (dotIdx === -1) return stripped
  return stripped.slice(0, dotIdx + 1) + stripped.slice(dotIdx + 1).replace(/\./g, '').slice(0, 2)
}

// Format a raw amount string for display with thousand separators.
// integer (Gs): dot separator, no decimals → "1.500.000"
// decimal (USD): comma separator, preserves up to 2 decimal places → "1,234.56"
export function formatAmountDisplay(raw: string, decimal = false): string {
  if (!raw) return ''
  if (!decimal) {
    return raw.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }
  const [intPart = '', decPart] = raw.split('.')
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return decPart !== undefined ? `${formattedInt}.${decPart}` : formattedInt
}
