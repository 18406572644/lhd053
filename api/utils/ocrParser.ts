export interface OcrParsedResult {
  line: string
  startStation: string
  endStation: string
  type: 'bus' | 'metro'
  travelDate: string
}

export function parseOcrText(text: string): OcrParsedResult {
  const result: OcrParsedResult = {
    line: '',
    startStation: '',
    endStation: '',
    type: 'metro',
    travelDate: '',
  }

  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
  const fullText = lines.join(' ')

  const lineMatch = fullText.match(/(\d+号线)/)
  if (lineMatch) {
    result.line = lineMatch[1]
    result.type = 'metro'
  } else {
    const busLineMatch = fullText.match(/(\d+路)/)
    if (busLineMatch) {
      result.line = busLineMatch[1]
      result.type = 'bus'
    }
  }

  const stationPattern = /[\u4e00-\u9fa5\d]+站/g
  const stations = fullText.match(stationPattern) || []
  const uniqueStations = [...new Set(stations)]
  
  if (uniqueStations.length >= 2) {
    result.startStation = uniqueStations[0]
    result.endStation = uniqueStations[1]
  } else if (uniqueStations.length === 1) {
    result.startStation = uniqueStations[0]
  }

  const datePatterns = [
    /(\d{4})[-/年](\d{1,2})[-/月](\d{1,2})日?/,
    /(\d{1,2})[-/月](\d{1,2})日?/,
  ]

  for (const pattern of datePatterns) {
    const match = fullText.match(pattern)
    if (match) {
      let year: string
      let month: string
      let day: string

      if (pattern.source.includes('\\d{4}') && match[1]?.length === 4) {
        year = match[1]
        month = match[2]
        day = match[3]
      } else {
        year = String(new Date().getFullYear())
        month = match[1]
        day = match[2]
      }

      const monthNum = month.padStart(2, '0')
      const dayNum = day.padStart(2, '0')
      result.travelDate = `${year}-${monthNum}-${dayNum}`
      break
    }
  }

  return result
}
