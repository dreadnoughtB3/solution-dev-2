"use client"

import { ChevronRight, MapPin, X } from "lucide-react"
import type { POI } from "@/types/map"

interface POIPanelProps {
  isOpen: boolean
  onClose: () => void
  pois: POI[]
  selectedPoi: POI | null
  onSelectPoi: (poi: POI | null) => void
}

export default function POIPanel({ isOpen, onClose, pois, selectedPoi, onSelectPoi }: POIPanelProps) {
  return (
    <div
      className={`absolute top-0 right-0 h-full bg-white shadow-lg transition-transform duration-300 overflow-hidden flex flex-col w-80 ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
      style={{ zIndex: 10 }}
    >
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">検索結果 ({pois.length})</h2>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
          <X size={20} />
        </button>
      </div>

      <div className="flex-grow overflow-auto">
        {selectedPoi ? (
          <div className="p-4">
            <button onClick={() => onSelectPoi(null)} className="flex items-center text-blue-600 mb-4">
              <ChevronRight className="rotate-180 mr-1" size={16} />
              <span>一覧に戻る</span>
            </button>

            <h3 className="text-xl font-bold mb-2">{selectedPoi.name}</h3>

            <div className="flex items-start gap-2 mb-3 text-gray-600">
              <MapPin size={18} className="mt-0.5 flex-shrink-0" />
              <span>{selectedPoi.address || "住所情報なし"}</span>
            </div>

            {selectedPoi.category && (
              <div className="mb-3">
                <span className="inline-block px-2 py-1 bg-gray-100 rounded-full text-sm">{selectedPoi.category}</span>
              </div>
            )}

            <div className="mt-4">
              <h4 className="font-medium mb-2">座標</h4>
              <div className="bg-gray-50 p-2 rounded text-sm">
                <div>緯度: {selectedPoi.coordinates.lat.toFixed(6)}</div>
                <div>経度: {selectedPoi.coordinates.lng.toFixed(6)}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="divide-y">
            {pois.map((poi) => (
              <div key={poi.id} className="p-4 hover:bg-gray-50 cursor-pointer" onClick={() => onSelectPoi(poi)}>
                <h3 className="font-medium">{poi.name}</h3>
                {poi.address && <p className="text-sm text-gray-600 mt-1 truncate">{poi.address}</p>}
                {poi.category && (
                  <span className="inline-block mt-2 px-2 py-0.5 bg-gray-100 rounded-full text-xs">{poi.category}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
