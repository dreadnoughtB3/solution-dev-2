"use client";

import { useEffect, useRef, useState } from "react"
import mapboxgl from "mapbox-gl"
import MapboxLanguage from "@mapbox/mapbox-gl-language"
import "mapbox-gl/dist/mapbox-gl.css"
// Types
import type { Coordinates } from "@/types/map"
// Service
import { getLocation } from "@/services/geolocation"

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? ""

export default function TestPage() {
  const mapContainer = useRef<HTMLDivElement | null>(null)
  const markerRef = useRef<mapboxgl.Marker | null>(null)

  const [map, setMap] = useState<mapboxgl.Map | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [destination, setDestination] = useState<Coordinates>({lng: 139.7670516, lat: 35.6811673})

  // Rendering Map
  useEffect(() => {
    if (map) return

    const fetchLocationAndSetLoading = async () => {
      try {
        const res = await getLocation();
        setDestination({lng: res.lng, lat: res.lat})
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocationAndSetLoading();

    if (!isLoading) {
      const initMap = new mapboxgl.Map({
        container: mapContainer.current!,
        center: [destination.lng, destination.lat],
        zoom: 13,
        style: "mapbox://styles/mapbox/streets-v12",
      })

      const language = new MapboxLanguage({ defaultLanguage: "ja" })
      initMap.addControl(language)

      const startMarker = new mapboxgl.Marker({ draggable: true }).setLngLat([destination.lng, destination.lat]).addTo(initMap)
      markerRef.current = startMarker

      initMap.on("load", () => {
        setMap(initMap)
        initMap.resize()
      })
    }
  }, [destination.lat, destination.lng, isLoading, map])

  if (isLoading) {
    return (
      <div className="text-center mt-12">Now Loading...</div>
    )
  } else {
    return (
      <div className="relative w-full h-screen">
        <div className="absolute inset-0">
          <div ref={mapContainer} className="w-full h-full" />
        </div>
      </div>
    )
  }
}
