'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxLanguage from '@mapbox/mapbox-gl-language';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? '';

export default function SimpleMap() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const [routeInfo, setRouteInfo] = useState<{ distance: number; duration: number } | null>(null);
  const poiMarkers = useRef<mapboxgl.Marker[]>([]);

  const destination: [number, number] = [139.7670516, 35.6811673]; // 東京駅

  const drawRoute = async () => {
    if (!map || !markerRef.current) return;

    const origin = markerRef.current.getLngLat();
    const from = `${origin.lng},${origin.lat}`;
    const to = `${destination[0]},${destination[1]}`;

    const query = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/driving/${from};${to}?geometries=geojson&access_token=${mapboxgl.accessToken}`
    );
    const data = await query.json();
    const route = data.routes[0].geometry;

    const distance = (data.routes[0].distance / 1000).toFixed(2);
    const duration = (data.routes[0].duration / 60).toFixed(1);
    setRouteInfo({ distance: parseFloat(distance), duration: parseFloat(duration) });

    if (map.getSource('route')) {
      map.removeLayer('route');
      map.removeSource('route');
    }

    map.addSource('route', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: route,
      },
    });

    map.addLayer({
      id: 'route',
      type: 'line',
      source: 'route',
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': '#10b981',
        'line-width': 5,
      },
    });
  };

  const searchAeonWithSearchBox = async () => {
    if (!map || !markerRef.current) return;

    const center = markerRef.current.getLngLat();
    const sessionToken = crypto.randomUUID();

    // cleanup old markers
    poiMarkers.current.forEach((m) => m.remove());
    poiMarkers.current = [];

    // Step 1: Suggest
    const suggestRes = await fetch(
      `https://api.mapbox.com/search/searchbox/v1/suggest?q=イオン&proximity=${center.lng},${center.lat}&limit=10&language=ja&access_token=${mapboxgl.accessToken}&session_token=${sessionToken}`
    );

    const suggestData = await suggestRes.json();

    if (!suggestData.suggestions || suggestData.suggestions.length === 0) {
      alert('検索結果が見つかりませんでした');
      return;
    }

    // Step 2: Retrieve each suggestion to get coordinates
    for (const suggestion of suggestData.suggestions) {
      const retrieveRes = await fetch(
        `https://api.mapbox.com/search/searchbox/v1/retrieve/${suggestion.mapbox_id}?session_token=${sessionToken}&access_token=${mapboxgl.accessToken}`
      );
      const retrieveData = await retrieveRes.json();

      if (!retrieveData.features || retrieveData.features.length === 0) continue;

      const feature = retrieveData.features[0];
      const [lng, lat] = feature.geometry.coordinates;
      const name = feature.properties.name ?? feature.name ?? 'イオン';

      const marker = new mapboxgl.Marker({ color: '#f97316' })
        .setLngLat([lng, lat])
        .setPopup(new mapboxgl.Popup().setText(name))
        .addTo(map);

      poiMarkers.current.push(marker);
    }
  };

  useEffect(() => {
    if (map) return;

    const initMap = new mapboxgl.Map({
      container: mapContainer.current!,
      center: destination,
      zoom: 12,
      style: 'mapbox://styles/mapbox/streets-v12',
    });

    const language = new MapboxLanguage({ defaultLanguage: 'ja' });
    initMap.addControl(language);

    const startMarker = new mapboxgl.Marker({ draggable: true })
      .setLngLat([139.760, 35.676])
      .addTo(initMap);

    markerRef.current = startMarker;

    initMap.on('load', () => {
      setMap(initMap);
      initMap.resize();
    });
  }, [map]);

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />

      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button
          onClick={drawRoute}
          style={{
            padding: '10px 16px',
            backgroundColor: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          東京駅までのルートを表示
        </button>

        <button
          onClick={searchAeonWithSearchBox}
          style={{
            padding: '10px 16px',
            backgroundColor: '#f59e0b',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          「イオン」を検索
        </button>
      </div>

      {routeInfo && (
        <div
          style={{
            position: 'absolute',
            top: 100,
            left: 20,
            padding: '10px 14px',
            backgroundColor: '#ffffffee',
            borderRadius: '8px',
            boxShadow: '0 0 6px rgba(0,0,0,0.2)',
            zIndex: 1,
            fontSize: '14px',
          }}
        >
          <div>距離: {routeInfo.distance} km</div>
          <div>所要時間: 約 {routeInfo.duration} 分</div>
        </div>
      )}
    </div>
  );
}
