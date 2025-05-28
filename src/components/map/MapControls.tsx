"use client"

import type { RouteInfo } from "@/types/map"

interface MapControlsProps {
  contourMinute: number
  setContourMinute: (radius: number) => void
  onSearchPOIs: () => void
  routeInfo: RouteInfo | null
}

export default function MapControls({
  contourMinute,
  setContourMinute,
  onSearchPOIs,
  routeInfo,
}: MapControlsProps) {
  return (
    <>
      <div className="absolute top-5 left-5 z-10 flex flex-col gap-2.5 bg-gray-800/80 p-3 rounded-lg">
        <div className="flex flex-col gap-2.5">
          <label className="text-white">
            移動時間: {contourMinute}分
            <input
              type="range"
              min={5}
              max={60}
              value={contourMinute}
              onChange={(e) => setContourMinute(Number(e.target.value))}
              className="w-full mt-1"
            />
          </label>

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
