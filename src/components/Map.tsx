'use client';

import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { LocationFeature } from '@/types/geojson';

interface MapProps {
  locations?: LocationFeature[];
}

export default function Map({ locations = [] }: MapProps) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const previousLocationsRef = useRef<LocationFeature[]>([]);
  const sourceId = 'locations-source';
  const layerId = 'locations-layer';

  useEffect(() => {
    if (mapRef.current) return;

    const maptilerKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY || '';
    if (!maptilerKey) {
      console.error('Maptiler API key is not configured. Please set NEXT_PUBLIC_MAPTILER_API_KEY in your environment variables.');
    }

    mapRef.current = new maplibregl.Map({
      container: mapContainer.current!,
      style: `https://api.maptiler.com/maps/streets-v4/style.json?key=${maptilerKey}`,
      center: [103.8198, 1.3521], // Singapore
      zoom: 11,
    });

    mapRef.current.on('load', () => {
      // Add source for GeoJSON data
      mapRef.current!.addSource(sourceId, {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
      });

      // Add layer for polygons/areas
      mapRef.current!.addLayer({
        id: layerId,
        type: 'fill',
        source: sourceId,
        paint: {
          'fill-color': '#3b82f6',
          'fill-opacity': 0.3,
        },
      });

      // Add outline for polygons
      mapRef.current!.addLayer({
        id: `${layerId}-outline`,
        type: 'line',
        source: sourceId,
        paint: {
          'line-color': '#2563eb',
          'line-width': 2,
        },
      });
    });
  }, []);

  // Update map when locations change
  useEffect(() => {
    // Check if locations actually changed
    const locationsChanged = JSON.stringify(locations) !== JSON.stringify(previousLocationsRef.current);
    if (!locationsChanged) return;
    
    // Early exit if both old and new are empty
    if (locations.length === 0 && previousLocationsRef.current.length === 0) return;
    
    if (!mapRef.current) return;
    
    if (!mapRef.current.isStyleLoaded()) {
      mapRef.current.once('style.load', processLocations);
      return;
    }

    processLocations();
    previousLocationsRef.current = JSON.parse(JSON.stringify(locations));
    
    function processLocations() {
      if (!mapRef.current) return;
      
      // Clear existing markers
      markersRef.current.forEach(marker => {
        try {
          marker.remove();
        } catch (error) {
          // Silently handle marker removal errors
        }
      });
      markersRef.current = [];
      
      // Clear existing GeoJSON source data
      const existingSource = mapRef.current.getSource(sourceId) as maplibregl.GeoJSONSource;
      if (existingSource) {
        existingSource.setData({
          type: 'FeatureCollection',
          features: [],
        });
      }
      
      // If no new locations, we're done
      if (locations.length === 0) return;
      
      const polygonFeatures: LocationFeature[] = [];
      const bounds = new maplibregl.LngLatBounds();
      let hasValidBounds = false;

      // Helper to extend bounds from coordinates
      const extendBoundsFromCoords = (coords: number[]) => {
        if (coords.length >= 2 && typeof coords[0] === 'number' && typeof coords[1] === 'number') {
          bounds.extend([coords[0], coords[1]]);
          hasValidBounds = true;
        }
      };

      locations.forEach((location) => {
        if (!location.geometry) return;

        const geometry = location.geometry;

        // Handle point geometries with markers
        if (geometry.type === 'Point' && geometry.coordinates) {
          const [lng, lat] = geometry.coordinates;
          if (typeof lng === 'number' && typeof lat === 'number') {
            bounds.extend([lng, lat]);
            hasValidBounds = true;

            // Create marker element
            const el = document.createElement('div');
            el.className = 'location-marker';
            Object.assign(el.style, {
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              backgroundColor: '#3b82f6',
              border: '3px solid white',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
            });

            const marker = new maplibregl.Marker({ element: el })
              .setLngLat([lng, lat])
              .setPopup(
                new maplibregl.Popup().setHTML(
                  `<div style="padding: 8px; color: #1f2937; font-weight: 600;"><strong>${location.properties?.name || 'Location'}</strong></div>`
                )
              )
              .addTo(mapRef.current!);

            markersRef.current.push(marker);
          }
        } else {
          // Handle polygon/other geometries
          polygonFeatures.push(location);
          
          if (geometry.type === 'Polygon' && geometry.coordinates) {
            geometry.coordinates[0].forEach(extendBoundsFromCoords);
          } else if (geometry.type === 'MultiPolygon' && geometry.coordinates) {
            geometry.coordinates.forEach((polygon: number[][][]) => {
              polygon[0].forEach(extendBoundsFromCoords);
            });
          }
        }
      });

      // Update GeoJSON source with polygon features
      const source = mapRef.current.getSource(sourceId) as maplibregl.GeoJSONSource;
      if (source) {
        source.setData({
          type: 'FeatureCollection',
          features: polygonFeatures,
        });
      }

      // Fit map to bounds if we have valid locations
      // hasValidBounds ensures bounds was extended, so isEmpty() check is redundant but safe
      if (hasValidBounds) {
        mapRef.current.fitBounds(bounds, {
          padding: 50,
          maxZoom: 15,
          duration: 1000,
        });
      }
    }
  }, [locations]);

  return <div ref={mapContainer} className="h-full w-full" />;
}
