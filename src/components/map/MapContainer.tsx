"use client"

import { useEffect, useRef, useState } from "react"
import mapboxgl from "mapbox-gl"
import MapboxLanguage from "@mapbox/mapbox-gl-language"
import "mapbox-gl/dist/mapbox-gl.css"
// Services
import { mapService } from "@/services/mapService"
// Components
import MapControls from "./MapControls"
import POIPanel from "./POIPanel"
import PanelToggle from "./PanelToggle"

import type { Coordinates, POI } from "@/types/map"

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? ""

export default function MapContainer() {
  const mapContainer = useRef<HTMLDivElement | null>(null)
  const markerRef = useRef<mapboxgl.Marker | null>(null)
  const poiMarkers = useRef<mapboxgl.Marker[]>([])
  const initLocation = {lng: 139.6969226, lat: 35.691595}

  const [map, setMap] = useState<mapboxgl.Map | null>(null)
  const [contourMinute, setContourMinute] = useState<number>(10)
  const [pois, setPois] = useState<POI[]>([])
  const [selectedPoi, setSelectedPoi] = useState<POI | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(false)
  const [routingProfile, setRoutingProfile] = useState<string>("driving")

  const searchPOIs = async () => {
    if (!map || !markerRef.current) return

    const center = markerRef.current.getLngLat()
    const centerCoords: Coordinates = { lng: center.lng, lat: center.lat }

    try {
      // マーカーをクリア
      poiMarkers.current.forEach((m) => m.remove())
      poiMarkers.current = []

      await drawIsochroneArea()

      // POIを検索
      const foundPois = await mapService.searchCategory({
        query: "supermarket",
        radius: 15,
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

  const drawIsochroneArea = async () => {
    if (!map || !markerRef.current) return

    if (map.getLayer('isochrone-fill')) map.removeLayer('isochrone-fill');
    if (map.getSource('isochrones')) map.removeSource('isochrones');

    const center = markerRef.current.getLngLat()
    const centerCoords: Coordinates = { lng: center.lng, lat: center.lat }
    const isochroneGeoJson = await mapService.getIsochroneAPI(centerCoords, contourMinute, routingProfile)

    map.addSource('isochrones', {
      type: 'geojson',
      data: isochroneGeoJson?.geometry,
    });

    map.addLayer({
      id: 'isochrone-fill',
      type: 'fill',
      source: 'isochrones',
      layout: {},
      paint: {
        'fill-color': [ // 等時線データに含まれる色プロパティを優先し、なければデフォルト色
          'case',
          ['has', 'color'], // 'color' プロパティがある場合
          ['get', 'color'], // その色を使用
          '#007cbf'         // なければデフォルト色
        ],
        'fill-opacity': 0.3, // 透明度
      },
    });
  }

  // 地図描画
  useEffect(() => {
    if (!map) {
      const initMap = new mapboxgl.Map({
        container: mapContainer.current!,
        center: [initLocation.lng, initLocation.lat],
        zoom: 12,
        style: "mapbox://styles/mapbox/streets-v12",
      })

      const language = new MapboxLanguage({ defaultLanguage: "ja" })
      initMap.addControl(language)

      const startMarker = new mapboxgl.Marker({ draggable: true }).setLngLat([initLocation.lng, initLocation.lat]).addTo(initMap)

      markerRef.current = startMarker

      initMap.on("load", () => {
        setMap(initMap)
        initMap.resize()
      })
    }
  }, [])

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
        routingProfle={routingProfile}
        contourMinute={contourMinute}
        setContourMinute={setContourMinute}
        setRoutingProfile={setRoutingProfile}
        onSearchPOIs={searchPOIs}
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
