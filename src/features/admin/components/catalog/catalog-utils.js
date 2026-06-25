const DELETED_GUIDE_HEADINGS_KEY = 'bhumisha-nexus-deleted-guide-headings'

export function getFirstFile(value) {
  if (!value) return null
  if (typeof FileList !== 'undefined' && value instanceof FileList) return value.item(0)
  if (Array.isArray(value)) return value[0] || null
  return value
}

export function getFiles(value) {
  if (!value) return []
  if (typeof FileList !== 'undefined' && value instanceof FileList) return Array.from(value)
  if (Array.isArray(value)) return value.filter(Boolean)
  return [value].filter(Boolean)
}

export function isValidCropImage(file) {
  if (!file) return true
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg']
  return allowedTypes.includes(file.type) && file.size <= 50 * 1024 * 1024
}

export function areValidCropImages(files = []) {
  return files.every(isValidCropImage)
}

export function readDeletedGuideHeadings() {
  if (typeof window === 'undefined') return []

  try {
    const rows = JSON.parse(window.localStorage.getItem(DELETED_GUIDE_HEADINGS_KEY) || '[]')
    return Array.isArray(rows) ? rows : []
  } catch {
    return []
  }
}

export function writeDeletedGuideHeadings(rows) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(DELETED_GUIDE_HEADINGS_KEY, JSON.stringify(rows))
}

export function createEmptyGuideDetailRow() {
  return {
    title: '',
    title_hi: '',
    description: '',
    description_hi: '',
    media: undefined,
  }
}
