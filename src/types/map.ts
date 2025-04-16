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
  }
  
  export interface SearchOptions {
    query: string
    radius: number
    center: Coordinates
  }
  