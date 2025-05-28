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

import type { Coordinates, POI, RouteInfo } from "@/types/map"

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? ""

export default function MapContainer() {
  const mapContainer = useRef<HTMLDivElement | null>(null)
  const markerRef = useRef<mapboxgl.Marker | null>(null)
  const poiMarkers = useRef<mapboxgl.Marker[]>([])
  const initLocation = { lng: 139.6969226, lat: 35.691595 }

  const [map, setMap] = useState<mapboxgl.Map | null>(null)
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null)
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
        radius: 15, // 決め打ち
        center: centerCoords,
      })

      if (foundPois.length === 0) {
        alert("検索結果が見つかりませんでした")
        return
      }

      const poisWithRouteInfo = await Promise.all(
        foundPois.map(async (poi) => {
          try {
            const { distance, duration } = await mapService.getRoute(centerCoords, poi.coordinates);
            return { ...poi, distance, duration };
          } catch (err) {
            console.warn(`ルート情報の取得に失敗: ${poi.name}`, err);
            return poi;
          }
        })
      );

      setPois(poisWithRouteInfo);

      poisWithRouteInfo.forEach((poi) => {
        const marker = new mapboxgl.Marker({ color: "#f97316" })
          .setLngLat([poi.coordinates.lng, poi.coordinates.lat])
          .setPopup(new mapboxgl.Popup().setText(`${poi.name}\n距離: ${poi.distance ?? "-"}km\n時間: ${poi.duration ?? "-"}分`))
          .addTo(map);

        marker.getElement().addEventListener("click", () => {
          setSelectedPoi(poi);
          setIsPanelOpen(true);
        });

        poiMarkers.current.push(marker);
      });

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

  const drawRoute = async () => {
    if (!map || !markerRef.current) return

    const origin = markerRef.current.getLngLat()
    const originCoords: Coordinates = { lng: origin.lng, lat: origin.lat }

    try {
      const { route, routeInfo } = await mapService.getRouteWithGeometry(originCoords, initLocation)
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
          geometry: route,
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
    setIsPanelOpen(!isPanelOpen);
  }

  return (
    <div className="relative w-full h-screen">
      <div className="absolute inset-0">
        <div ref={mapContainer} className="w-full h-full" />
      </div>
      <MapControls
        routingProfle={routingProfile}
        contourMinute={contourMinute}
        setContourMinute={setContourMinute}
        setRoutingProfile={setRoutingProfile}
        routeInfo={routeInfo}
        onDrawRoute={drawRoute}
        onSearchPOIs={searchPOIs}
      />
      <PanelToggle isOpen={isPanelOpen} onClick={togglePanel} />
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
