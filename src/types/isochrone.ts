// --- GeoJSON Core Types ---
// Properties can be an object with string keys and values of various types
type GeoJsonProperties = {
  [key: string]: string | number | boolean | null | GeoJsonProperties | (string | number | boolean | null | GeoJsonProperties)[];
};

// All possible GeoJSON Geometry types
type Point = {
  type: "Point";
  coordinates: [number, number];
};

type LineString = {
  type: "LineString";
  coordinates: [number, number][];
};

type Polygon = {
  type: "Polygon";
  coordinates: [number, number][][];
};

type MultiPoint = {
  type: "MultiPoint";
  coordinates: [number, number][];
};

type MultiLineString = {
  type: "MultiLineString";
  coordinates: [number, number][][];
};

type MultiPolygon = {
  type: "MultiPolygon";
  coordinates: [number, number][][][];
};

type GeometryCollection = {
  type: "GeometryCollection";
  geometries: (Point | LineString | Polygon | MultiPoint | MultiLineString | MultiPolygon)[];
};

type GeoJsonGeometry = Point | LineString | Polygon | MultiPoint | MultiLineString | MultiPolygon | GeometryCollection;

// Generic GeoJSON Feature structure
type GeoJsonFeature<G extends GeoJsonGeometry, P extends GeoJsonProperties> = {
  type: "Feature";
  properties: P;
  geometry: G;
};

// Generic GeoJSON Feature Collection structure
type GeoJsonFeatureCollection<F extends GeoJsonFeature<GeoJsonGeometry, GeoJsonProperties>> = {
  type: "FeatureCollection";
  features: F[];
};

// --- Mapbox Isochrone API Specific Types ---

/**
 * Properties specific to an Isochrone Feature returned by Mapbox.
 */
export interface IsochroneFeatureProperties extends GeoJsonProperties {
  /**
   * The value of the contour, typically in minutes (e.g., 5, 10, 15).
   */
  contour: number;
  /**
   * An optional suggested color (CSS color string) for rendering the contour.
   * Example: "#FF0000"
   */
  color?: string;
  // Add any other specific properties if the Isochrone API documentation details them.
  // For example, if it returns 'id' or 'name' for the contour.
}

/**
 * Represents a single isochrone contour as a GeoJSON Feature.
 * The geometry type will be `Polygon` if `polygons=true` was used in the request,
 * otherwise it would be `LineString` (though for Isochrones, Polygon is most common).
 */
export type IsochroneFeature = GeoJsonFeature<Polygon | LineString, IsochroneFeatureProperties>;

/**
 * The top-level response structure for the Mapbox Isochrone API.
 * It is a GeoJSON FeatureCollection containing one or more Isochrone Features.
 */
export type MapboxIsochroneApiResponse = GeoJsonFeatureCollection<IsochroneFeature>;