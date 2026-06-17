import { Router } from 'express'
import { parseOcrText, type OcrParsedResult } from '../utils/ocrParser.js'

export const ocrRouter = Router()

const mockTexts = [
  `北京地铁
1号线
苹果园站 → 四惠东站
2024-06-15
票价：6元`,
  `上海地铁
2号线
人民广场站 陆家嘴站
2024/05/20
单程票`,
  `广州市公共汽车
38路
体育中心站 天河城站
2024年03月10日
票价 2元`,
  `深圳地铁
11号线
福田站 → 机场站
2024-07-01
商务车厢`,
]

ocrRouter.post('/recognize', (req, res) => {
  const randomIndex = Math.floor(Math.random() * mockTexts.length)
  const mockText = mockTexts[randomIndex]
  
  const parsed = parseOcrText(mockText)

  setTimeout(() => {
    res.json({
      success: true,
      rawText: mockText,
      parsed,
    })
  }, 800 + Math.random() * 500)
})

ocrRouter.post('/parse', (req, res) => {
  const { text } = req.body
  if (!text || typeof text !== 'string') {
    res.status(400).json({ error: 'Missing text parameter' })
    return
  }

  const parsed = parseOcrText(text)
  res.json({
    success: true,
    parsed,
  })
})
