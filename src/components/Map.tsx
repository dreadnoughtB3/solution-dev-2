'use client';
import { useEffect, useState, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxLanguage from '@mapbox/mapbox-gl-language';
import 'mapbox-gl/dist/mapbox-gl.css';
 
export default function SimpleMap() {
  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? '';
  const mapContainer = useRef(null);
  const [map, setMap] = useState(null);
 
  useEffect(() => {
    const initializeMap = ({
      setMap,
      mapContainer,
    }: {
      setMap: any;
      mapContainer: any;
    }) => {
      const map = new mapboxgl.Map({
        container: mapContainer.current,
        center: [139.7670516, 35.6811673], // 東京駅を初期値点として表示（緯度、経度を指定）
        zoom: 10,
        style: 'mapbox://styles/mapbox/streets-v12',
      });
      const language = new MapboxLanguage({ defaultLanguage: 'ja' });
      map.addControl(language);

      const marker = new mapboxgl.Marker({
        draggable: true
      })
        .setLngLat([139.767, 35.681])
        .addTo(map);
 
      map.on('load', () => {
        setMap(map);
        map.resize();
      });
    };
 
    if (!map) initializeMap({ setMap, mapContainer });
  }, [map]);
 
  return (
    <>
      <div ref={mapContainer} style={{ width: '100%', height: '100vh' }} />
    </>
  );
}