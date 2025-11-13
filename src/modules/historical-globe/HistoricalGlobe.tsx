'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Play, Pause, RotateCcw } from 'lucide-react'
import * as Cesium from 'cesium'
import 'cesium/Build/Cesium/Widgets/widgets.css'

// Set Cesium base URL
if (typeof window !== 'undefined') {
  ;(window as any).CESIUM_BASE_URL = '/cesium'
}

interface YearData {
  year: number
  filename: string
  countries: string[]
}

export default function HistoricalGlobe() {
  const cesiumContainer = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<Cesium.Viewer | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [yearsData, setYearsData] = useState<YearData[]>([])
  const [currentYearIndex, setCurrentYearIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load index.json
  useEffect(() => {
    fetch('/historical-basemaps/index.json')
      .then((res) => res.json())
      .then((data) => {
        setYearsData(data.years || [])
        setIsLoading(false)
      })
      .catch((err) => {
        console.error('Error loading index:', err)
        setError('Failed to load historical data')
        setIsLoading(false)
      })
  }, [])

  // Initialize Cesium
  useEffect(() => {
    if (!cesiumContainer.current || isLoading || yearsData.length === 0) return

    const initCesium = async () => {
      try {
        // Set Cesium Ion token (public token)
        Cesium.Ion.defaultAccessToken =
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5N2UyMjcwOS00MDY1LTQxYjEtYjZjMy00YTU0ZTg1YmUwYjQiLCJpZCI6ODAzMDYsImlhdCI6MTY0Mjc0ODI2MX0.dkwAL1CcljUV7NA7fDbhXXnmyZQU_c-G5zRx8PtEcxE'

        // Create Cesium Viewer
        const viewer = new Cesium.Viewer(cesiumContainer.current as HTMLElement, {
          terrain: Cesium.Terrain.fromWorldTerrain(),
          baseLayerPicker: false,
          geocoder: false,
          homeButton: false,
          sceneModePicker: false,
          navigationHelpButton: false,
          animation: false,
          timeline: false,
          fullscreenButton: false,
          vrButton: false,
          infoBox: false,
          selectionIndicator: false,
        })

        viewerRef.current = viewer

        // Set initial camera position
        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(0, 20, 20000000),
          orientation: {
            heading: Cesium.Math.toRadians(0.0),
            pitch: Cesium.Math.toRadians(-90.0),
          },
          duration: 0,
        })

        // Load initial year data
        await loadYearData(yearsData[currentYearIndex])
      } catch (err) {
        console.error('Error initializing Cesium:', err)
        setError('Failed to initialize 3D globe')
      }
    }

    initCesium()

    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy()
        viewerRef.current = null
      }
    }
  }, [isLoading, yearsData])

  // Load GeoJSON for specific year
  const loadYearData = async (yearData: YearData) => {
    if (!viewerRef.current || !yearData) return

    try {
      const viewer = viewerRef.current

      // Clear existing data sources
      viewer.dataSources.removeAll()

      // Load GeoJSON
      const dataSource = await Cesium.GeoJsonDataSource.load(`/historical-basemaps/geojson/${yearData.filename}`, {
        stroke: Cesium.Color.WHITE,
        fill: Cesium.Color.YELLOW.withAlpha(0.5),
        strokeWidth: 2,
        clampToGround: true,
      })

      await viewer.dataSources.add(dataSource)

      // Style entities with random colors
      const entities = dataSource.entities.values
      for (let i = 0; i < entities.length; i++) {
        const entity = entities[i]
        if (entity.polygon) {
          const color = Cesium.Color.fromRandom({ alpha: 0.6 })
          entity.polygon.material = color as any
          entity.polygon.outline = true as any
          entity.polygon.outlineColor = Cesium.Color.WHITE as any
          entity.polygon.outlineWidth = 2 as any
        }
      }
    } catch (err) {
      console.error('Error loading year data:', err)
    }
  }

  // Handle year change
  useEffect(() => {
    if (yearsData.length > 0 && currentYearIndex >= 0 && currentYearIndex < yearsData.length) {
      loadYearData(yearsData[currentYearIndex])
    }
  }, [currentYearIndex, yearsData])

  // Animation loop
  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      setCurrentYearIndex((prev) => {
        if (prev >= yearsData.length - 1) {
          setIsPlaying(false)
          return prev
        }
        return prev + 1
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [isPlaying, yearsData.length])

  const currentYear = yearsData[currentYearIndex]?.year || 0
  const displayYear = currentYear < 0 ? `${Math.abs(currentYear)} BC` : `${currentYear} AD`

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-b from-gray-900 to-black">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500">Error</h2>
          <p className="mt-2 text-gray-400">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4" variant="outline">
            Reload Page
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-screen w-full">
      {/* Cesium Container */}
      <div ref={cesiumContainer} className="h-full w-full" />

      {/* Controls Overlay */}
      <div className="absolute bottom-8 left-1/2 z-10 w-full max-w-2xl -translate-x-1/2 transform rounded-lg bg-black/80 p-6 backdrop-blur-sm">
        {/* Year Display */}
        <div className="mb-4 text-center">
          <h2 className="text-3xl font-bold text-white">{displayYear}</h2>
          {currentYear && yearsData[currentYearIndex]?.countries && (
            <p className="mt-1 text-sm text-gray-300">{yearsData[currentYearIndex].countries.length} territories</p>
          )}
        </div>

        {/* Timeline Slider */}
        <div className="mb-4">
          <input
            type="range"
            min={0}
            max={yearsData.length - 1}
            step={1}
            value={currentYearIndex}
            onChange={(e) => {
              setCurrentYearIndex(parseInt(e.target.value))
              setIsPlaying(false)
            }}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-700 accent-blue-600"
            style={{
              background: `linear-gradient(to right, #2563eb 0%, #2563eb ${(currentYearIndex / (yearsData.length - 1)) * 100}%, #374151 ${(currentYearIndex / (yearsData.length - 1)) * 100}%, #374151 100%)`,
            }}
          />
          {/* Year markers */}
          <div className="mt-2 flex justify-between text-xs text-gray-400">
            <span>123,000 BC</span>
            <span>Present</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-center gap-4">
          <Button
            onClick={() => setCurrentYearIndex(0)}
            variant="outline"
            size="sm"
            className="bg-white/10 text-white hover:bg-white/20"
          >
            <RotateCcw size={16} className="mr-2" />
            Reset
          </Button>

          <Button
            onClick={() => setIsPlaying(!isPlaying)}
            variant="default"
            size="sm"
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            {isPlaying ? (
              <>
                <Pause size={16} className="mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play size={16} className="mr-2" />
                Play
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Info Panel */}
      <div className="absolute top-4 right-4 z-10 max-w-xs rounded-lg bg-black/80 p-4 backdrop-blur-sm">
        <h3 className="mb-2 text-lg font-bold text-white">Historical Globe</h3>
        <p className="text-sm text-gray-300">
          Explore world history from 123,000 BC to present day. Use the timeline below to navigate through different
          periods.
        </p>
        <div className="mt-3 border-t border-gray-700 pt-3">
          <p className="text-xs text-gray-400">
            Data source:{' '}
            <a
              href="https://github.com/aourednik/historical-basemaps"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              Historical Basemaps
            </a>
          </p>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="text-center">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            <p className="text-lg text-white">Loading Historical Globe...</p>
            <p className="mt-2 text-sm text-gray-400">Preparing 3D visualization...</p>
          </div>
        </div>
      )}
    </div>
  )
}
