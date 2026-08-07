"use client"

// Scoped here, not in `globals.css`.
//
// It used to be `@import 'leaflet/dist/leaflet.css'` at globals.css:12 — 3.5 KB
// gzipped shipped to the homepage, all 226 book chapters and all 21 tools, for
// a map that appears on exactly one route. Importing it inside a client
// component puts it in that component's chunk instead.
import "leaflet/dist/leaflet.css"

import dynamic from "next/dynamic"
import { useTranslations } from "next-intl"
import { useTheme } from "next-themes"

import { ToolCard } from "@/components/shared/ToolCard"

import { MAP_ZOOM } from "../constants"

/**
 * Where the address is, roughly.
 *
 * **Leaflet, not MapLibre** — measured rather than assumed. MapLibre GL 6 with
 * OpenFreeMap's key-free vector tiles renders better and was the obvious 2026
 * answer, but it is ~230 KB gzipped against Leaflet's **42 KB**, and on this
 * page the map confirms an answer rather than being the answer. Five times the
 * JavaScript for a confirmation is the wrong trade on a content site.
 *
 * CARTO's basemaps rather than OSM's standard tiles: 9–12 KB per tile against
 * 36 KB (measured 2026-08-06), they come in a light and a dark variant that
 * follow the site's theme, and OSM's own tile policy asks that production
 * traffic go elsewhere.
 *
 * `ssr: false` is load-bearing, not caution: Leaflet touches `window` at module
 * scope and throws during a prerender.
 */

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
)
const CircleMarker = dynamic(
  () => import("react-leaflet").then((mod) => mod.CircleMarker),
  { ssr: false }
)

const TILES = {
  light: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
} as const

const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'

interface LocationMapProps {
  latitude: number | null
  longitude: number | null
}

export function LocationMap({ latitude, longitude }: LocationMapProps) {
  const t = useTranslations("IpInfoPage.map")
  const { resolvedTheme } = useTheme()

  const hasPoint = latitude !== null && longitude !== null

  return (
    // The card stretches and the MAP takes the slack, rather than the card
    // ending in dead space.
    //
    // The two columns are a CSS grid, and a grid stretches its items to the
    // tallest row by default. The left column carries three panels and the
    // right two, so the map card was being pulled ~80px taller than its
    // content and the difference sat empty under the accuracy note. Shrinking
    // the card would have fixed the gap; growing the map is the better answer,
    // because a bigger map is the thing a reader wanted more of anyway.
    <ToolCard
      title={t("title")}
      className="flex flex-col"
      bodyClassName="flex flex-1 flex-col p-0"
    >
      <div className="min-h-[18rem] w-full flex-1 overflow-hidden">
        {hasPoint ? (
          <MapContainer
            // Remounting on a new position is deliberate. `MapContainer`
            // ignores a changed `center` after mount, and the alternative —
            // an inner component calling `useMap().setView()` — is what the
            // old code did with a `require()` inside the render body.
            key={`${latitude},${longitude}`}
            center={[latitude, longitude]}
            zoom={MAP_ZOOM}
            scrollWheelZoom={false}
            className="h-full w-full"
          >
            <TileLayer
              url={resolvedTheme === "dark" ? TILES.dark : TILES.light}
              attribution={ATTRIBUTION}
            />
            {/* A circle, not a pin: a pin points at a rooftop, and this data
                is accurate to a city on a good day. */}
            <CircleMarker
              center={[latitude, longitude]}
              radius={14}
              pathOptions={{
                color: "var(--primary)",
                fillColor: "var(--primary)",
                fillOpacity: 0.25,
                weight: 2
              }}
            />
          </MapContainer>
        ) : (
          <div className="flex h-full items-center justify-center px-5 text-center text-muted-foreground text-sm">
            {t("noPoint")}
          </div>
        )}
      </div>

      {/* Under the map, always, and pinned to the bottom of the card. The
          number of people who read an IP map as a street address is the reason
          this sentence is not in a tooltip. */}
      <p className="shrink-0 rounded-b-xl border-border border-t px-5 py-3 text-muted-foreground text-xs">
        {t("accuracy")}
      </p>
    </ToolCard>
  )
}
