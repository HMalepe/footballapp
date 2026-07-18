type Cell = string | number

// Quote a cell if it contains a comma, quote, or newline (RFC 4180).
export function escapeCell(value: Cell): string {
  const str = String(value)
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

// Build a CSV string from headers + rows (pure — no DOM).
export function toCsv(headers: string[], rows: Cell[][]): string {
  return [headers, ...rows].map((row) => row.map(escapeCell).join(',')).join('\n')
}

// Build a CSV string and trigger a browser download.
export function downloadCsv(name: string, headers: string[], rows: Cell[][]) {
  const csv = toCsv(headers, rows)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${name}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
