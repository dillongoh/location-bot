// GeoJSON types for location data
export interface GeoJSONPoint {
  type: 'Point';
  coordinates: [number, number]; // [lng, lat]
}

export interface GeoJSONPolygon {
  type: 'Polygon';
  coordinates: number[][][];
}

export interface GeoJSONMultiPolygon {
  type: 'MultiPolygon';
  coordinates: number[][][][];
}

export type GeoJSONGeometry = GeoJSONPoint | GeoJSONPolygon | GeoJSONMultiPolygon;

export interface LocationFeature {
  type: 'Feature';
  geometry: GeoJSONGeometry;
  properties: {
    name: string;
    [key: string]: unknown;
  };
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: LocationFeature[];
}

