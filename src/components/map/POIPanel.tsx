"use client"

import { ChevronRight, MapPin, X } from "lucide-react"
import type { POI } from "@/types/map"
import { useState } from "react"

interface POIPanelProps {
  isOpen: boolean
  onClose: () => void
  pois: POI[]
  selectedPoi: POI | null
  onSelectPoi: (poi: POI | null) => void
}

export default function POIPanel({ isOpen, onClose, pois, selectedPoi, onSelectPoi }: POIPanelProps) {
  const [activeTab, setActiveTab] = useState<"results" | "others">("results")

  // 商品と価格データ
  const storeNames = ["スーパーA", "スーパーB", "スーパーC"]
  const products = [
    { name: "レタス", prices: [300, 310, 298] },
    { name: "肉", prices: [265, 270, 260] },
    { name: "卵", prices: [320, 290, 300] },
    { name: "牛乳", prices: [253, 253, 256] }
  ]
  const gasFee = 991

  const calculateTotal = (prices: number[]) => {
    const subtotal = prices.reduce((sum, p) => sum + p, 0)
    return {
      subtotal,
      total: subtotal + gasFee
    }
  }

  return (
    <div
      className={`absolute top-0 right-0 h-full bg-white shadow-lg transition-transform duration-300 overflow-hidden flex flex-col w-80 ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
      style={{ zIndex: 10 }}
    >
      {/* ヘッダー */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">
          {activeTab === "results" ? `検索結果 (${pois.length})` : "商品比較表"}
        </h2>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
          <X size={20} />
        </button>
      </div>

      {/* タブ切り替え */}
      <div className="flex border-b text-sm">
        <button
          onClick={() => setActiveTab("results")}
          className={`flex-1 py-2 ${activeTab === "results" ? "border-b-2 border-blue-500 font-semibold text-blue-600" : "text-gray-500"}`}
        >
          検索結果
        </button>
        <button
          onClick={() => setActiveTab("others")}
          className={`flex-1 py-2 ${activeTab === "others" ? "border-b-2 border-blue-500 font-semibold text-blue-600" : "text-gray-500"}`}
        >
          商品比較表
        </button>
      </div>

      {/* 内容 */}
      <div className="flex-grow overflow-auto">
        {activeTab === "results" ? (
          selectedPoi ? (
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
                  <span className="inline-block px-2 py-1 bg-gray-100 rounded-full text-sm">
                    {selectedPoi.category}
                  </span>
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
                    <span className="inline-block mt-2 px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                      {poi.category}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="p-4 text-sm text-gray-700">
            {/* 商品比較表 */}
            <div className="overflow-auto">
              <table className="w-full border text-sm mb-4">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-2 py-1 text-left">商品</th>
                    {storeNames.map((name) => (
                      <th key={name} className="border px-2 py-1 text-center">{name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.name}>
                      <td className="border px-2 py-1">{product.name}</td>
                      {product.prices.map((price, i) => (
                        <td key={i} className="border px-2 py-1 text-center">¥{price}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 合計価格（例としてスーパーAの計算） */}
            <div className="bg-gray-50 p-3 rounded text-sm">
              <p>スーパーAの商品合計: ¥{calculateTotal(products.map(p => p.prices[0])).subtotal}</p>
              <p>ガソリン代: ¥{gasFee}</p>
              <p className="font-bold mt-2">総合価格: ¥{calculateTotal(products.map(p => p.prices[0])).total}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
