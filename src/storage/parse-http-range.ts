export function parseHTTPRange(
  value: null | string,
  fileSize: number,
): false | null | { end: number; start: number } {
  if (!value) return null
  const match = /^bytes=(\d*)-(\d*)$/.exec(value)
  if (!match) return false

  if (!match[1]) {
    const suffixLength = Number.parseInt(match[2], 10)
    if (!Number.isSafeInteger(suffixLength) || suffixLength <= 0) return false

    return { end: fileSize - 1, start: Math.max(fileSize - suffixLength, 0) }
  }

  const start = Number.parseInt(match[1], 10)
  const requestedEnd = match[2] ? Number.parseInt(match[2], 10) : fileSize - 1
  const end = Math.min(requestedEnd, fileSize - 1)
  return start <= end && start < fileSize ? { end, start } : false
}
