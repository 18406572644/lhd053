import { Router } from 'express'
import { getCities, getCityData } from '../subwayData.js'

export const citiesRouter = Router()

citiesRouter.get('/', (_req, res) => {
  const cities = getCities()
  res.json(cities)
})

citiesRouter.get('/:city/lines', (req, res) => {
  const cityId = req.params.city
  const cityData = getCityData(cityId)
  res.json({
    id: cityData.id,
    name: cityData.name,
    center: cityData.center,
    zoom: cityData.zoom,
    lineColors: cityData.lineColors,
    lines: cityData.lines,
  })
})
