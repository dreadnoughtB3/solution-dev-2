import type { Coordinates, POI, RouteInfo, SearchOptions, CategorySearchFeature } from "@/types/map"

export class MapService {
  private accessToken: string

  constructor() {
    this.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? ""
  }

  // 経路探索API
  async getRoute(
    origin: Coordinates,
    destination: Coordinates,
  ): Promise<{
    route: GeoJSON.Feature<GeoJSON.Geometry>
    routeInfo: RouteInfo
  }> {
    const from = `${origin.lng},${origin.lat}`
    const to = `${destination.lng},${destination.lat}`

    const query = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/driving/${from};${to}?geometries=geojson&access_token=${this.accessToken}`,
    )
    const data = await query.json()
    const route = data.routes[0].geometry

    const distance = Number.parseFloat((data.routes[0].distance / 1000).toFixed(2))
    const duration = Number.parseFloat((data.routes[0].duration / 60).toFixed(1))

    return {
      route,
      routeInfo: { distance, duration },
    }
  }

  // 通常検索API
  async searchPOIs(options: SearchOptions): Promise<POI[]> {
    const { query, radius, center } = options
    const sessionToken = crypto.randomUUID()

    // Bounding Box計算
    const radiusKm = radius
    const lat = center.lat
    const lon = center.lng

    const deltaLat = radiusKm / 111
    const deltaLng = radiusKm / (111 * Math.cos((lat * Math.PI) / 180))

    const bbox = [
      (lon - deltaLng).toFixed(6),
      (lat - deltaLat).toFixed(6),
      (lon + deltaLng).toFixed(6),
      (lat + deltaLat).toFixed(6),
    ].join(",")

    // Search Box APIリクエスト
    const suggestRes = await fetch(
      `https://api.mapbox.com/search/searchbox/v1/suggest?q=${query}&proximity=${lon},${lat}&bbox=${bbox}&limit=10&language=ja&access_token=${this.accessToken}&session_token=${sessionToken}`,
    )

    const suggestData = await suggestRes.json()
    if (!suggestData.suggestions || suggestData.suggestions.length === 0) {
      return []
    }

    const pois: POI[] = []

    // 各提案の詳細を取得
    for (const suggestion of suggestData.suggestions) {
      const retrieveRes = await fetch(
        `https://api.mapbox.com/search/searchbox/v1/retrieve/${suggestion.mapbox_id}?session_token=${sessionToken}&access_token=${this.accessToken}`,
      )
      const retrieveData = await retrieveRes.json()

      if (!retrieveData.features || retrieveData.features.length === 0) continue

      const feature = retrieveData.features[0]
      const [lng, lat] = feature.geometry.coordinates
      const name = feature.properties.name ?? feature.name ?? query
      const address = feature.properties.address ?? feature.properties.full_address
      const category = feature.properties.category ?? feature.properties.place_type

      pois.push({
        id: feature.id || suggestion.mapbox_id,
        name,
        coordinates: { lng, lat },
        address,
        category,
      })
    }

    return pois
  }

  // カテゴリ検索API
  async searchCategory(options: SearchOptions): Promise<POI[]> {
    const { query, radius, center } = options
  
    const lat = center.lat
    const lon = center.lng
  
    const deltaLat = radius / 111
    const deltaLng = radius / (111 * Math.cos((lat * Math.PI) / 180))
  
    const bbox = [
      (lon - deltaLng).toFixed(6),
      (lat - deltaLat).toFixed(6),
      (lon + deltaLng).toFixed(6),
      (lat + deltaLat).toFixed(6),
    ].join("%2C")
  
    const res = await fetch(
      `https://api.mapbox.com/search/searchbox/v1/category/${query}?proximity=${lon}%2C${lat}&bbox=${bbox}&limit=25&language=ja&access_token=${this.accessToken}`
    )
  
    const data: { features: CategorySearchFeature[] } = await res.json()
  
    if (!data.features || data.features.length === 0) {
      return []
    }
  
    return data.features.map((feature): POI => {
      const mapbox_id = feature.properties.mapbox_id
      const [lng, lat] = feature.geometry.coordinates
      const name = feature.properties.name ?? query
      const address = feature.properties.address ?? feature.properties.full_address
  
      return {
        id: mapbox_id || crypto.randomUUID(),
        name,
        coordinates: { lng, lat },
        address
      }
    })
  }

  calculateSearchBbox(center: Coordinates, radiusKm: number): GeoJSON.Feature<GeoJSON.Polygon> {
    const lat = center.lat
    const lon = center.lng

    const deltaLat = radiusKm / 111
    const deltaLng = radiusKm / (111 * Math.cos((lat * Math.PI) / 180))

    return {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [lon - deltaLng, lat - deltaLat],
            [lon + deltaLng, lat - deltaLat],
            [lon + deltaLng, lat + deltaLat],
            [lon - deltaLng, lat + deltaLat],
            [lon - deltaLng, lat - deltaLat],
          ],
        ],
      },
      properties: {},
    }
  }
}

export const mapService = new MapService()
