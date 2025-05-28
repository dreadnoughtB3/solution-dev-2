export interface Coordinates {
    lng: number
    lat: number
}
  
export interface RouteInfo {
  distance: number
  duration: number
}
  
export interface POI {
  id: string
  name: string
  coordinates: Coordinates
  address?: string
  category?: string
  description?: string
  distance?: number
  duration?: number
}
  
export interface SearchOptions {
  query: string
  radius: number
  center: Coordinates
}

export interface CategorySearchFeature {
  id: string
  geometry: {
    type: "Point"
    coordinates: [number, number]
  }
  properties: {
    mapbox_id?: string,
    name?: string
    address?: string
    full_address?: string
    category?: string[]
    place_type?: string[]
  }
}