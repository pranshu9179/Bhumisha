import { Link } from 'react-router-dom'

const hashtagPattern = /(^|[\s([{])#([\p{L}\p{N}_-]+)/gu

export function HashtagText({ text, className }) {
  const value = String(text || '')
  if (!value) return '-'

  const parts = []
  let lastIndex = 0

  value.replace(hashtagPattern, (match, prefix, tag, offset) => {
    const hashIndex = offset + prefix.length
    if (hashIndex > lastIndex) {
      parts.push(value.slice(lastIndex, hashIndex))
    }

    if (prefix) {
      parts.push(prefix)
    }

    parts.push(
      <Link
        key={`${tag}-${offset}`}
        to={`/products?tag=${encodeURIComponent(tag)}`}
        className="font-semibold text-primary underline-offset-4 hover:underline"
        onClick={(event) => event.stopPropagation()}
      >
        #{tag}
      </Link>,
    )
    lastIndex = offset + match.length
    return match
  })

  if (lastIndex < value.length) {
    parts.push(value.slice(lastIndex))
  }

  return <span className={className}>{parts.length ? parts : value}</span>
}
