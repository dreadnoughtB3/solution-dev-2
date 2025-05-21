// components/MapDisplayWithIsochrones.tsx
"use client";

import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapboxIsochroneApiResponse } from '@/types/mapbox'; // 型定義のパスを適宜調整

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

interface MapDisplayProps {
  isochroneGeoJson: MapboxIsochroneApiResponse;
  center: [number, number]; // 地図の中心座標 [longitude, latitude]
  zoom?: number;
}

const MapDisplayWithIsochrones: React.FC<MapDisplayProps> = ({ isochroneGeoJson, center, zoom = 10 }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) {
      // マップが既に存在する場合は中心とズームを更新し、既存のレイヤーを削除して再描画
      mapRef.current.setCenter(center);
      mapRef.current.setZoom(zoom);
      if (mapRef.current.getLayer('isochrone-fill')) mapRef.current.removeLayer('isochrone-fill');
      if (mapRef.current.getSource('isochrones')) mapRef.current.removeSource('isochrones');
    } else {
      // マップの初期化
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: center,
        zoom: zoom,
      });
    }

    const map = mapRef.current;

    map.on('load', () => {
      // 1. GeoJSON Source の追加
      // Isochrone APIの戻り値はすでにGeoJSON FeatureCollectionなのでそのまま渡せる
      map.addSource('isochrones', {
        type: 'geojson',
        data: isochroneGeoJson,
      });

      // 2. Layer の追加 (塗りつぶし)
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

      // 3. Layer の追加 (アウトライン) - オプション
      map.addLayer({
        id: 'isochrone-border',
        type: 'line',
        source: 'isochrones',
        layout: {},
        paint: {
          'line-color': [
            'case',
            ['has', 'color'],
            ['get', 'color'],
            '#00598a' // デフォルトのアウトライン色
          ],
          'line-width': 2,
        },
      });

      // 地図の中心をデータに合わせて調整 (オプション)
      if (isochroneGeoJson.features.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        isochroneGeoJson.features.forEach(feature => {
          // PolygonとLineStringのcoordinatesを処理
          if (feature.geometry.type === 'Polygon') {
            feature.geometry.coordinates[0].forEach(coord => {
              bounds.extend(coord as [number, number]);
            });
          } else if (feature.geometry.type === 'LineString') {
            feature.geometry.coordinates.forEach(coord => {
              bounds.extend(coord as [number, number]);
            });
          }
        });
        map.fitBounds(bounds, { padding: 50, duration: 0 }); // データを画面に収める
      }
    });

    // コンポーネントのアンマウント時にマップをクリーンアップ
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [isochroneGeoJson, center, zoom]); // isochroneGeoJsonやcenterが変更されたら再実行

  return (
    <div ref={mapContainerRef} style={{ width: '100%', height: '500px' }} className="rounded-lg shadow-md" />
  );
};

export default MapDisplayWithIsochrones;