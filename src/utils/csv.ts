type Cell = string | number

// Quote a cell if it contains a comma, quote, or newline (RFC 4180).
function escapeCell(value: Cell): string {
  const str = String(value)
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

// Build a CSV string and trigger a browser download.
export function downloadCsv(name: string, headers: string[], rows: Cell[][]) {
  const lines = [headers, ...rows].map((row) => row.map(escapeCell).join(','))
  const csv = lines.join('\n')
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
