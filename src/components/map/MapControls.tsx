"use client"

import type { RouteInfo } from "@/types/map"

interface MapControlsProps {
  searchRadius: number
  setSearchRadius: (radius: number) => void
  onDrawRoute: () => void
  onSearchPOIs: () => void
  routeInfo: RouteInfo | null
}

export default function MapControls({
  searchRadius,
  setSearchRadius,
  onDrawRoute,
  onSearchPOIs,
  routeInfo,
}: MapControlsProps) {
  return (
    <>
      <div className="absolute top-5 left-5 z-10 flex flex-col gap-2.5 bg-gray-800/80 p-3 rounded-lg">
        <div className="flex flex-col gap-2.5">
          <label className="text-white">
            半径: {searchRadius}km
            <input
              type="range"
              min={5}
              max={50}
              value={searchRadius}
              onChange={(e) => setSearchRadius(Number(e.target.value))}
              className="w-full mt-1"
            />
          </label>

          <button
            onClick={onDrawRoute}
            className="px-4 py-2.5 bg-blue-600 text-white border-none rounded-md cursor-pointer hover:bg-blue-700 transition-colors"
          >
            東京駅までのルートを表示
          </button>

          <button
            onClick={onSearchPOIs}
            className="px-4 py-2.5 bg-amber-500 text-white border-none rounded-md cursor-pointer hover:bg-amber-600 transition-colors"
          >
            スーパーを検索
          </button>
        </div>
      </div>

      {routeInfo && (
        <div className="absolute top-[180px] left-5 p-3 bg-white/90 rounded-lg shadow-md z-10 text-sm">
          <div>距離: {routeInfo.distance} km</div>
          <div>時間: {routeInfo.duration} 分</div>
        </div>
      )}
    </>
  )
}
