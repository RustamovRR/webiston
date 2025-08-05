'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import dynamic from 'next/dynamic'
import { MapPin, Maximize2, Minimize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Dynamic import to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false })

// Map update component for re-centering
function MapUpdater({ center }: { center: [number, number] }) {
  const { useMap } = require('react-leaflet')
  const map = useMap()

  useEffect(() => {
    if (center[0] !== 0 && center[1] !== 0) {
      map.setView(center, 10)
    }
  }, [center, map])

  return null
}

interface MapViewProps {
  latitude: number
  longitude: number
  country: string
  city: string
  ip: string
  className?: string
}

export default function MapView({ latitude, longitude, country, city, ip, className = '' }: MapViewProps) {
  const [isClient, setIsClient] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [mapLoading, setMapLoading] = useState(true)
  const { theme } = useTheme()

  // Debug coordinates
  console.log('MapView coordinates:', { latitude, longitude, city, country, ip })

  // Check if coordinates are valid
  const hasValidCoordinates = latitude !== 0 && longitude !== 0 && !isNaN(latitude) && !isNaN(longitude)

  useEffect(() => {
    setIsClient(true)

    // Fix for default markers
    if (typeof window !== 'undefined') {
      const L = require('leaflet')
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: '/leaflet/marker-icon-2x.png',
        iconUrl: '/leaflet/marker-icon.png',
        shadowUrl: '/leaflet/marker-shadow.png',
      })
    }
  }, [])

  if (!isClient || !hasValidCoordinates) {
    return (
      <div
        className={`h-64 w-full rounded-lg border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 ${className}`}
      >
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <MapPin className="mx-auto mb-2 h-8 w-8 text-zinc-400" />
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {!isClient ? 'Xarita yuklanmoqda...' : 'Koordinatalar mavjud emas'}
            </p>
            {!hasValidCoordinates && isClient && (
              <p className="mt-1 text-xs text-zinc-400">
                Lat: {latitude}, Lng: {longitude}
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  const tileUrl =
    theme === 'dark'
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'

  const attribution =
    theme === 'dark'
      ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
      : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'

  const mapHeight = isFullscreen ? 'h-96' : 'h-64'

  return (
    <div
      className={`relative ${mapHeight} w-full overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700 ${className}`}
    >
      {/* Loading overlay */}
      {mapLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
          <div className="text-center">
            <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Xarita yuklanmoqda...</p>
          </div>
        </div>
      )}

      {/* Fullscreen toggle */}
      <Button
        variant="outline"
        size="sm"
        className="absolute top-2 right-2 z-20 bg-white/90 backdrop-blur-sm dark:bg-zinc-800/90"
        onClick={() => setIsFullscreen(!isFullscreen)}
      >
        {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
      </Button>

      {/* Map */}
      <MapContainer
        center={[latitude, longitude]}
        zoom={10}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
        zoomControl={true}
        scrollWheelZoom={false}
        doubleClickZoom={true}
        whenReady={() => setMapLoading(false)}
      >
        <MapUpdater center={[latitude, longitude]} />
        <TileLayer attribution={attribution} url={tileUrl} />
        <Marker position={[latitude, longitude]}>
          <Popup>
            <div className="p-2 text-center">
              <div className="font-semibold text-zinc-900">{ip}</div>
              <div className="mt-1 text-sm text-zinc-600">
                {city}, {country}
              </div>
              <div className="mt-1 text-xs text-zinc-500">
                {latitude.toFixed(4)}, {longitude.toFixed(4)}
              </div>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}
