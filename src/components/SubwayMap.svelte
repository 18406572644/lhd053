<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import L from 'leaflet'
  import 'leaflet/dist/leaflet.css'
  import 'leaflet.heat'
  import { currentCity } from '@/stores/app'
  import {
    getSubwayLines,
    findLineByStation,
    getRouteStations,
    getLineColor,
    getStationCoords,
    getCityCenter,
    getCityZoom,
    type Station,
    type SubwayLine,
  } from '@/data/subwayData'

  interface Props {
    startStation?: string
    endStation?: string
    lineName?: string
    height?: string
    showFullMap?: boolean
    heatmapData?: Array<{ lat: number; lng: number; count: number }>
    highlightSegments?: Array<{ from: string; to: string; line?: string; weight?: number }>
    cityId?: string
  }

  let {
    startStation = '',
    endStation = '',
    lineName = '',
    height = '300px',
    showFullMap = false,
    heatmapData = [],
    highlightSegments = [],
    cityId: propCityId = '',
  }: Props = $props()

  let cityId = $derived(propCityId || $currentCity)
  let containerRef: HTMLDivElement | null = null
  let map: L.Map | null = null
  let backgroundLines: L.Polyline[] = []
  let backgroundStations: L.CircleMarker[] = []
  let routeLine: L.Polyline | null = null
  let routeStations: L.CircleMarker[] = []
  let startMarker: L.Marker | null = null
  let endMarker: L.Marker | null = null
  let heatLayer: any = null
  let highlightLayers: L.Polyline[] = []

  currentCity.subscribe((v) => {
    if (!propCityId) {
      cityId = v
    }
  })

  $effect(() => {
    if (propCityId) {
      cityId = propCityId
    }
  })

  function createStationIcon(name: string, isStart: boolean) {
    return L.divIcon({
      className: 'custom-station-marker',
      html: `
        <div class="marker-wrapper">
          <div class="marker-dot ${isStart ? 'start' : 'end'}"></div>
          <div class="marker-label">${name}</div>
        </div>
      `,
      iconSize: [12, 12],
      iconAnchor: [6, 6],
    })
  }

  function clearMap() {
    backgroundLines.forEach((l) => l.remove())
    backgroundStations.forEach((s) => s.remove())
    backgroundLines = []
    backgroundStations = []

    if (routeLine) {
      routeLine.remove()
      routeLine = null
    }
    routeStations.forEach((s) => s.remove())
    routeStations = []

    if (startMarker) {
      startMarker.remove()
      startMarker = null
    }
    if (endMarker) {
      endMarker.remove()
      endMarker = null
    }

    if (heatLayer) {
      heatLayer.remove()
      heatLayer = null
    }

    highlightLayers.forEach((l) => l.remove())
    highlightLayers = []
  }

  function drawBackgroundLines() {
    const subwayLines = getSubwayLines(cityId)
    subwayLines.forEach((line) => {
      const coords = line.stations.map((s) => [s.lat, s.lng] as [number, number])
      const polyline = L.polyline(coords, {
        color: line.color,
        weight: 3,
        opacity: 0.25,
        lineJoin: 'round',
        lineCap: 'round',
      })
      polyline.addTo(map!)
      backgroundLines.push(polyline)
    })
  }

  function drawBackgroundStations() {
    const subwayLines = getSubwayLines(cityId)
    subwayLines.forEach((line) => {
      line.stations.forEach((station) => {
        const marker = L.circleMarker([station.lat, station.lng], {
          radius: 2,
          color: line.color,
          fillColor: '#ffffff',
          fillOpacity: 1,
          weight: 1.5,
          opacity: 0.4,
        })
        marker.addTo(map!)
        backgroundStations.push(marker)
      })
    })
  }

  function drawRoute() {
    if (!startStation || !endStation) return

    const subwayLines = getSubwayLines(cityId)
    let line: SubwayLine | null = null
    if (lineName) {
      line = subwayLines.find((l) => l.name === lineName) || null
    }
    if (!line) {
      line = findLineByStation(startStation, endStation, cityId)
    }

    const startCoords = getStationCoords(startStation, cityId)
    const endCoords = getStationCoords(endStation, cityId)

    if (line) {
      const stations = getRouteStations(line, startStation, endStation)
      if (stations.length > 0) {
        const coords = stations.map((s) => [s.lat, s.lng] as [number, number])
        routeLine = L.polyline(coords, {
          color: line.color,
          weight: 6,
          opacity: 0.9,
          lineJoin: 'round',
          lineCap: 'round',
        })
        routeLine.addTo(map!)

        stations.forEach((station) => {
          const marker = L.circleMarker([station.lat, station.lng], {
            radius: 4,
            color: line!.color,
            fillColor: '#ffffff',
            fillOpacity: 1,
            weight: 2,
            opacity: 1,
          })
          marker.addTo(map!)
          routeStations.push(marker)
        })

        const allBounds = L.latLngBounds(coords)
        map!.fitBounds(allBounds, { padding: [30, 30] })
      }
    }

    if (startCoords) {
      startMarker = L.marker([startCoords.lat, startCoords.lng], {
        icon: createStationIcon(startStation, true),
      })
      startMarker.addTo(map!)
    }

    if (endCoords) {
      endMarker = L.marker([endCoords.lat, endCoords.lng], {
        icon: createStationIcon(endStation, false),
      })
      endMarker.addTo(map!)
    }
  }

  function drawHeatmap() {
    if (heatmapData.length === 0) return

    const maxCount = Math.max(...heatmapData.map((d) => d.count), 1)
    const points = heatmapData.map((d) => [d.lat, d.lng, d.count / maxCount] as [number, number, number])

    heatLayer = (L as any).heatLayer(points, {
      radius: 25,
      blur: 20,
      maxZoom: 15,
      minOpacity: 0.3,
      gradient: { 0.2: '#4CAF50', 0.4: '#FFEB3B', 0.6: '#FF9800', 0.8: '#F44336', 1.0: '#B71C1C' },
    })
    heatLayer.addTo(map!)

    const bounds = L.latLngBounds(heatmapData.map((d) => [d.lat, d.lng] as [number, number]))
    if (bounds.isValid()) {
      map!.fitBounds(bounds, { padding: [50, 50] })
    }
  }

  function drawHighlightSegments() {
    const subwayLines = getSubwayLines(cityId)
    highlightSegments.forEach((seg) => {
      const fromCoords = getStationCoords(seg.from, cityId)
      const toCoords = getStationCoords(seg.to, cityId)
      if (!fromCoords || !toCoords) return

      const line = seg.line
        ? subwayLines.find((l) => l.name === seg.line)
        : findLineByStation(seg.from, seg.to, cityId)
      const color = line ? line.color : '#F44336'
      const weight = seg.weight || 5

      const coords: [number, number][] = []
      if (line) {
        const routeStations = getRouteStations(line, seg.from, seg.to)
        routeStations.forEach((s) => coords.push([s.lat, s.lng]))
      } else {
        coords.push([fromCoords.lat, fromCoords.lng])
        coords.push([toCoords.lat, toCoords.lng])
      }

      const polyline = L.polyline(coords, {
        color,
        weight,
        opacity: 0.85,
        lineJoin: 'round',
        lineCap: 'round',
      })
      polyline.addTo(map!)
      highlightLayers.push(polyline)
    })
  }

  function updateMapCenter() {
    if (!map) return
    const center = getCityCenter(cityId)
    const zoom = getCityZoom(cityId)
    map.setView([center.lat, center.lng], zoom)
  }

  function render() {
    if (!map) return
    clearMap()

    if (showFullMap || heatmapData.length > 0) {
      drawBackgroundLines()
      drawBackgroundStations()
    }

    if (heatmapData.length > 0) {
      drawHeatmap()
    } else if (highlightSegments.length > 0) {
      drawBackgroundLines()
      drawHighlightSegments()
      const allCoords: [number, number][] = []
      highlightSegments.forEach((seg) => {
        const from = getStationCoords(seg.from, cityId)
        const to = getStationCoords(seg.to, cityId)
        if (from) allCoords.push([from.lat, from.lng])
        if (to) allCoords.push([to.lat, to.lng])
      })
      if (allCoords.length > 0) {
        const bounds = L.latLngBounds(allCoords)
        map.fitBounds(bounds, { padding: [40, 40] })
      }
    } else {
      drawRoute()
    }
  }

  onMount(() => {
    if (!containerRef) return

    const center = getCityCenter(cityId)
    const zoom = getCityZoom(cityId)

    map = L.map(containerRef, {
      center: [center.lat, center.lng],
      zoom: zoom,
      zoomControl: false,
      attributionControl: false,
      dragging: true,
      scrollWheelZoom: false,
      touchZoom: false,
      doubleClickZoom: false,
    })

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    }).addTo(map)

    render()
  })

  onDestroy(() => {
    if (map) {
      map.remove()
      map = null
    }
  })

  $effect(() => {
    cityId
    updateMapCenter()
    render()
  })

  $effect(() => {
    startStation
    endStation
    lineName
    showFullMap
    heatmapData
    highlightSegments
    render()
  })
</script>

<div bind:this={containerRef} class="subway-map" style="height: {height};"></div>

<style>
  .subway-map {
    width: 100%;
    border-radius: var(--radius-md);
    overflow: hidden;
    background: #f5f7fa;
  }

  .subway-map :global(.leaflet-container) {
    background: #f5f7fa;
    font-family: var(--font-sans);
  }

  :global(.custom-station-marker) {
    background: transparent;
    border: none;
  }

  :global(.marker-wrapper) {
    position: relative;
    transform: translate(-50%, -50%);
  }

  :global(.marker-dot) {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    border: 3px solid;
    background: #fff;
    position: relative;
    z-index: 2;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  }

  :global(.marker-dot.start) {
    border-color: #43A047;
    background: #43A047;
  }

  :global(.marker-dot.end) {
    border-color: #E53935;
    background: #fff;
  }

  :global(.marker-label) {
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-top: 4px;
    background: rgba(0, 0, 0, 0.75);
    color: #fff;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 11px;
    white-space: nowrap;
    font-weight: 500;
  }

  :global(.leaflet-tile-pane) {
    opacity: 0.5;
  }
</style>
