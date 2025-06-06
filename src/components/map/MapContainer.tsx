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
  const initLocation = {lng: 139.6969226, lat: 35.691595}

  const [map, setMap] = useState<mapboxgl.Map | null>(null)
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null)
  const [contourMinute, setContourMinute] = useState<number>(10)
  const [pois, setPois] = useState<POI[]>([])
  const [selectedPoi, setSelectedPoi] = useState<POI | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(false)
<<<<<<< HEAD
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const [destination, setDestination] = useState<Coordinates>({ lng: 139.7670516, lat: 35.6811673 })
=======
  const [routingProfile, setRoutingProfile] = useState<string>("driving")
>>>>>>> 1c5780f2bb1467ef1fe20d5cdc6a18f00023007c

  const drawRoute = async () => {
    if (!map || !markerRef.current) return

    const origin = markerRef.current.getLngLat()
    const originCoords: Coordinates = { lng: origin.lng, lat: origin.lat }

    try {
<<<<<<< HEAD
      const { route, routeInfo } = await mapService.getRouteWithGeometry(originCoords, destination)
=======
      const { route, routeInfo } = await mapService.getRoute(originCoords, initLocation)
>>>>>>> 1c5780f2bb1467ef1fe20d5cdc6a18f00023007c
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

  const searchPOIs = async () => {
    if (!map || !markerRef.current) return;

    const center = markerRef.current.getLngLat();
    const centerCoords: Coordinates = { lng: center.lng, lat: center.lat };

    try {
<<<<<<< HEAD
      drawSearchBbox();
      poiMarkers.current.forEach((m) => m.remove());
      poiMarkers.current = [];

=======
      // マーカーをクリア
      poiMarkers.current.forEach((m) => m.remove())
      poiMarkers.current = []

      await drawIsochroneArea()

      // POIを検索
>>>>>>> 1c5780f2bb1467ef1fe20d5cdc6a18f00023007c
      const foundPois = await mapService.searchCategory({
        query: "supermarket",
        radius: 15,
        center: centerCoords,
      });

      if (foundPois.length === 0) {
        alert("検索結果が見つかりませんでした");
        return;
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

      setIsPanelOpen(true);
    } catch (error) {
      console.error("POI検索エラー:", error);
    }
  };

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
<<<<<<< HEAD
    if (map) return

    const fetchLocationAndSetLoading = async () => {
      try {
        const res = await getLocation();
        console.log('取得した位置情報:', res);
        setDestination({ lng: res.lng, lat: res.lat });
      } catch (error) {
        console.error('位置情報の取得に失敗しました:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocationAndSetLoading();

    if (!isLoading) {
=======
    if (!map) {
>>>>>>> 1c5780f2bb1467ef1fe20d5cdc6a18f00023007c
      const initMap = new mapboxgl.Map({
        container: mapContainer.current!,
        center: [initLocation.lng, initLocation.lat],
        zoom: 12,
        style: "mapbox://styles/mapbox/streets-v12",
      });

      const language = new MapboxLanguage({ defaultLanguage: "ja" });
      initMap.addControl(language);

<<<<<<< HEAD
      const startMarker = new mapboxgl.Marker({ draggable: true }).setLngLat([destination.lng, destination.lat]).addTo(initMap);
=======
      const startMarker = new mapboxgl.Marker({ draggable: true }).setLngLat([initLocation.lng, initLocation.lat]).addTo(initMap)
>>>>>>> 1c5780f2bb1467ef1fe20d5cdc6a18f00023007c

      markerRef.current = startMarker;

      initMap.on("load", () => {
        setMap(initMap);
        initMap.resize();
      });
    }
<<<<<<< HEAD
  }, [isLoading]);

  useEffect(() => {
    if (!map || !markerRef.current) return;

    const source = map.getSource("search-radius");
    if (source) {
      drawSearchBbox();
    }
  }, [searchRadius]);
=======
  }, [])

  // 検索範囲描画
  // useEffect(() => {
  //   if (!map || !markerRef.current) return

  //   const source = map.getSource("search-radius")
  //   if (source) {
  //     drawSearchBbox()
  //   }
  // }, [searchRadius])
>>>>>>> 1c5780f2bb1467ef1fe20d5cdc6a18f00023007c

  const togglePanel = () => {
    setIsPanelOpen(!isPanelOpen);
  }

<<<<<<< HEAD
  if (isLoading) {
    return <div>Now Loading...</div>;
  } else {
    return (
      <div className="relative w-full h-screen">
        <div className="absolute inset-0">
          <div ref={mapContainer} className="w-full h-full" />
        </div>

        <MapControls
          searchRadius={searchRadius}
          setSearchRadius={setSearchRadius}
          onDrawRoute={drawRoute}
          onSearchPOIs={searchPOIs}
          routeInfo={routeInfo}
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
    );
  }
=======
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
>>>>>>> 1c5780f2bb1467ef1fe20d5cdc6a18f00023007c
}
