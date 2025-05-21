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
  // タブの状態（検索結果 / 商品比較表）
  const [activeTab, setActiveTab] = useState<"results" | "others">("results")

  // スーパー名のリスト
  const [storeNames, setStoreNames] = useState(["スーパーA", "スーパーB", "スーパーC"])

  // 商品とその価格データ
  const [products, setProducts] = useState<{ name: string; prices: (number | "")[] }[]>([
    { name: "レタス", prices: [300, 310, 298] },
    { name: "肉", prices: [265, 270, 260] },
    { name: "卵", prices: [320, 290, 300] },
    { name: "牛乳", prices: [253, 253, 256] }
  ])

  // 入力中の新しい商品名
  const [newProductName, setNewProductName] = useState("")

  // 新しいスーパーを追加する（選択されたPOI名）
  const handleAddStore = (storeName: string) => {
    if (!storeNames.includes(storeName)) {
      setStoreNames([...storeNames, storeName])
      // 各商品に新しいスーパー分の価格列（初期値0）を追加
      setProducts(products.map(product => ({
        ...product,
        prices: [...product.prices, 0]
      })))
    }
  }

  // 新しい商品を追加する
  const handleAddProduct = () => {
    if (newProductName.trim() === "") return
    setProducts([
      ...products,
      { name: newProductName.trim(), prices: storeNames.map(() => 0) }
    ])
    setNewProductName("")
  }

  // 商品を削除
  const handleDeleteProduct = (index: number) => {
    setProducts(products.filter((_, i) => i !== index))
  }

  // スーパーを削除（列を削除）
  const handleDeleteStore = (storeIndex: number) => {
    setStoreNames(prev => prev.filter((_, i) => i !== storeIndex))
    setProducts(prev =>
      prev.map(p => ({
        ...p,
        prices: p.prices.filter((_, i) => i !== storeIndex)
      }))
    )
  }

  // 商品価格の変更
  const handlePriceChange = (productIndex: number, storeIndex: number, value: string) => {
    const newProducts = [...products]
    const price = value === "" ? "" : Number(value)
    newProducts[productIndex].prices[storeIndex] = price
    setProducts(newProducts)
  }

  // 各スーパーの合計金額を計算し、最も安い店舗のインデックスを返す
  const getCheapestIndex = () => {
    const totals = storeNames.map((_, idx) =>
      products.reduce((sum, p) => {
        const val = p.prices[idx]
        return sum + (typeof val === "number" ? val : 0)
      }, 0)
    )
    const min = Math.min(...totals)
    return totals.findIndex(t => t === min)
  }

  return (
    <div    
      className={`absolute top-0 right-0 h-full bg-white shadow-lg transition-transform duration-300 overflow-hidden flex flex-col w-[480px] ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
      style={{ zIndex: 10 }}
    >
      {/* パネルヘッダー */}
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

      {/* パネル内容 */}
      <div className="flex-grow overflow-auto">
        {activeTab === "results" ? (
          // 検索結果タブの中身
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

              {/* 商品比較表に追加ボタン */}
              <div className="mt-4">
                <button
                  onClick={() => handleAddStore(selectedPoi.name)}
                  className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 text-sm"
                >
                  商品比較表に追加する
                </button>
              </div>
            </div>
          ) : (
            // POI一覧
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
          // 商品比較表タブの中身
          <div className="p-4 text-sm text-gray-700">

            {/* 商品追加フォーム */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">新しい商品名</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="flex-grow border border-gray-300 rounded px-2 py-1 text-sm"
                  placeholder="例：トマト"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                />
                <button
                  onClick={handleAddProduct}
                  className="bg-blue-500 text-white text-sm px-3 py-1 rounded hover:bg-blue-600"
                >
                  追加
                </button>
              </div>
            </div>

            {/* 商品比較表 */}
            <div className="overflow-auto">
              <table className="w-full border text-sm mb-4">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-2 py-1 text-left">商品</th>
                    {storeNames.map((name, storeIdx) => (
                      <th key={name} className="border px-2 py-1 text-center relative group">
                        <div className="flex justify-center items-center gap-1">
                          <span>{name}</span>
                          <button
                            onClick={() => handleDeleteStore(storeIdx)}
                            className="text-red-500 text-xs hover:text-red-700"
                          >
                            ×
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, pIdx) => (
                    <tr key={product.name}>
                      <td className="border px-2 py-1 flex justify-between items-center">
                        {product.name}
                        <button
                          onClick={() => handleDeleteProduct(pIdx)}
                          className="text-red-500 text-xs hover:text-red-700"
                        >
                          ×
                        </button>
                      </td>
                      {product.prices.map((price, sIdx) => (
                        <td key={sIdx} className="border px-2 py-1 text-center">
                          <input
                            type="number"
                            value={price}
                            onChange={(e) => handlePriceChange(pIdx, sIdx, e.target.value)}
                            className="w-16 px-1 py-0.5 text-right border rounded"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 各スーパーの合計価格と最安店舗の表示 */}
            <div className="bg-gray-50 p-3 rounded text-sm">
              <h4 className="font-semibold mb-2">各スーパーの合計</h4>
              {storeNames.map((name, idx) => {
                const subtotal = products.reduce((sum, p) => {
                  const val = p.prices[idx]
                  return sum + (typeof val === "number" ? val : 0)
                }, 0)

                return (
                  <div
                    key={name}
                    className={`${idx === getCheapestIndex() ? "text-green-700 font-bold" : "text-gray-800"}`}
                  >
                    {name}：商品合計 ¥{subtotal}
                  </div>
                )
              })}
              <div className="mt-2 text-blue-700 font-semibold">
                最も安い店舗: {storeNames[getCheapestIndex()]}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}
