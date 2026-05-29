import dayjs from 'dayjs'

export function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value ?? 0)
}

export function formatCompactNumber(value) {
  return new Intl.NumberFormat('en-IN', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value ?? 0)
}

export function formatDate(value, pattern = 'DD MMM YYYY') {
  if (!value) return '-'
  return dayjs(value).format(pattern)
}

export function formatRelativeHours(value) {
  if (!value) return '-'
  const hours = dayjs().diff(dayjs(value), 'hour', true)
  return `${hours.toFixed(1)} hr`
}

export function sentenceCase(value) {
  if (!value) return ''
  return value
    .split(/[_-]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}
