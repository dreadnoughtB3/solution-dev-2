"use client";

import Map from "react-map-gl/mapbox"
import mapboxgl from "mapbox-gl"; // mapbox-gl-js をインポート
import 'mapbox-gl/dist/mapbox-gl.css';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import MapboxDirections from '@mapbox/mapbox-gl-directions';

const accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? '';
const initialViewState = {
  latitude: 35.6895,
  longitude: 139.6917,
  zoom: 14,
};


function TestMap() {
  return (
    <div>
        <Map
        initialViewState={initialViewState}
        mapboxAccessToken={accessToken}
        mapLib={mapboxgl as any}
        language="ja"
        style={{position: "absolute", top: 0, bottom: 0, width: "100%"}}
        mapStyle="mapbox://styles/mapbox/light-v11">
        </Map>
    </div>
  )
}

export default TestMap