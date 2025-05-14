"use client"

import { useEffect, useRef, useState } from "react"
import mapboxgl from "mapbox-gl"
import MapboxLanguage from "@mapbox/mapbox-gl-language"
import "mapbox-gl/dist/mapbox-gl.css"
// Services
import { mapService } from "@/services/mapService"
import { getLocation } from "@/services/geolocation"
// Components
import MapControls from "./MapControls"
import POIPanel from "./POIPanel"
import PanelToggle from "./PanelToggle"

import type { Coordinates, POI, RouteInfo } from "@/types/map"

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? ""

export default function MapContainer() {
  const mapContainer = useRef<HTMLDivElement | null>(null)
  const markerRef = useRef<mapboxgl.Marker | null>(null)
  const poiMarkers = useRef<mapboxgl.Marker[]>([])

  const [map, setMap] = useState<mapboxgl.Map | null>(null)
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null)
  const [searchRadius, setSearchRadius] = useState<number>(15)
  const [pois, setPois] = useState<POI[]>([])
  const [selectedPoi, setSelectedPoi] = useState<POI | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(false)

  const [destination, setDestination] = useState<Coordinates>({lng: 139.7670516, lat: 35.6811673})

  const drawRoute = async () => {
    if (!map || !markerRef.current) return

    const origin = markerRef.current.getLngLat()
    const originCoords: Coordinates = { lng: origin.lng, lat: origin.lat }

    try {
      const { route, routeInfo } = await mapService.getRoute(originCoords, destination)
      setRouteInfo(routeInfo)

      if (map.getSource("route")) {
        map.removeLayer("route")
        map.removeSource("route")
      }

      map.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: route.geometry,
        },
      })

      map.addLayer({
        id: "route",
        type: "line",
        source: "route",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#10b981",
          "line-width": 5,
        },
      })
    } catch (error) {
      console.error("ルート取得エラー:", error)
    }
  }

  const searchPOIs = async () => {
    if (!map || !markerRef.current) return

    const center = markerRef.current.getLngLat()
    const centerCoords: Coordinates = { lng: center.lng, lat: center.lat }

    try {
      // 検索範囲を描画
      drawSearchBbox()

      // マーカーをクリア
      poiMarkers.current.forEach((m) => m.remove())
      poiMarkers.current = []

      // POIを検索
      const foundPois = await mapService.searchCategory({
        query: "supermarket",
        radius: searchRadius,
        center: centerCoords,
      })

      setPois(foundPois)

      if (foundPois.length === 0) {
        alert("検索結果が見つかりませんでした")
        return
      }

      // マーカーを追加
      foundPois.forEach((poi) => {
        const marker = new mapboxgl.Marker({ color: "#f97316" })
          .setLngLat([poi.coordinates.lng, poi.coordinates.lat])
          .setPopup(new mapboxgl.Popup().setText(poi.name))
          .addTo(map)

        marker.getElement().addEventListener("click", () => {
          setSelectedPoi(poi)
          setIsPanelOpen(true)
        })

        poiMarkers.current.push(marker)
      })

      // パネルを開く
      setIsPanelOpen(true)
    } catch (error) {
      console.error("POI検索エラー:", error)
    }
  }

  const drawSearchBbox = () => {
    if (!map || !markerRef.current) return

    const center = markerRef.current.getLngLat()
    const centerCoords: Coordinates = { lng: center.lng, lat: center.lat }

    const geojsonBbox = mapService.calculateSearchBbox(centerCoords, searchRadius)

    const source = map.getSource("search-radius")
    if (source && "setData" in source) {
      ;(source as mapboxgl.GeoJSONSource).setData(geojsonBbox)
    } else {
      map.addSource("search-radius", {
        type: "geojson",
        data: geojsonBbox,
      })

      map.addLayer({
        id: "search-radius",
        type: "fill",
        source: "search-radius",
        paint: {
          "fill-color": "#93c5fd",
          "fill-opacity": 0.3,
        },
      })
    }
  }

  useEffect(() => {
    if (map) return

    const fetchLocation = async () => {
      const loc = await getLocation();
      console.log(loc)
    }

    fetchLocation()

    const initMap = new mapboxgl.Map({
      container: mapContainer.current!,
      center: [destination.lng, destination.lat],
      zoom: 12,
      style: "mapbox://styles/mapbox/streets-v12",
    })

    const language = new MapboxLanguage({ defaultLanguage: "ja" })
    initMap.addControl(language)

    const startMarker = new mapboxgl.Marker({ draggable: true }).setLngLat([139.76, 35.676]).addTo(initMap)

    markerRef.current = startMarker

    initMap.on("load", () => {
      setMap(initMap)
      initMap.resize()
    })
  }, [])

  useEffect(() => {
    if (!map || !markerRef.current) return

    const source = map.getSource("search-radius")
    if (source) {
      drawSearchBbox()
    }
  }, [searchRadius])

  const togglePanel = () => {
    setIsPanelOpen(!isPanelOpen)
  }

  return (
    <div className="relative w-full h-screen">
      {/* マップは常に画面全体を占める */}
      <div className="absolute inset-0">
        <div ref={mapContainer} className="w-full h-full" />
      </div>

      {/* マップコントロール */}
      <MapControls
        searchRadius={searchRadius}
        setSearchRadius={setSearchRadius}
        onDrawRoute={drawRoute}
        onSearchPOIs={searchPOIs}
        routeInfo={routeInfo}
      />

      {/* パネルトグルボタン - 常に表示 */}
      <PanelToggle isOpen={isPanelOpen} onClick={togglePanel} />

      {/* POIパネル - マップの上にオーバーレイ */}
      <POIPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        pois={pois}
        selectedPoi={selectedPoi}
        onSelectPoi={setSelectedPoi}
      />
    </div>
  )
}
