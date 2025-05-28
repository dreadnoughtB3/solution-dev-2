"use client"

interface MapControlsProps {
  routingProfle: string
  contourMinute: number
  setRoutingProfile: (profile: string) => void
  setContourMinute: (radius: number) => void
  onSearchPOIs: () => void
}

const profileList = [{label: "運転", value: "driving"}, {label: "徒歩", value: "walking"}, {label: "自転車", value: "cycling"}]

export default function MapControls({
  routingProfle,
  contourMinute,
  setRoutingProfile,
  setContourMinute,
  onSearchPOIs,
}: MapControlsProps) {
  return (
    <>
      <div className="absolute top-5 left-5 z-10 flex flex-col gap-2.5 bg-white/90 p-4 rounded-lg">
        <div className="flex flex-col gap-2.5">
          <label className="font-bold">
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

          <div className="flex justify-between">
            {profileList.map((v) => {
              if(routingProfle == v.value) {
                return (
                  <button key={v.value} onClick={() => setRoutingProfile(v.value)}
                    className="text-white bg-blue-500 hover:bg-blue-700 py-1 px-7 rounded-full">
                    {v.label}
                  </button>
                )
              }else{
                return (
                  <button key={v.value} onClick={() => setRoutingProfile(v.value)}
                    className="text-stone-400 hover:bg-stone-200 py-1 px-7 rounded-full">
                    {v.label}
                  </button>
                )
              }

            })}
          </div>

          <button
            onClick={onSearchPOIs}
            className="px-4 py-2.5 bg-amber-500 text-white border-none rounded-md cursor-pointer hover:bg-amber-600 transition-colors"
          >
            スーパーを検索
          </button>
        </div>
      </div>
    </>
  )
}
