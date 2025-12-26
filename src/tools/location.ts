export async function searchLocation(query: string) {
  console.log('🔍 searchLocation called with query:', query);
  // Limit results to 10, restrict search to Singapore only
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&polygon_geojson=1&limit=10&countrycodes=sg&accept-language=en`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('Nominatim API error');

  const data = await res.json();

  // Map data to GeoJSON FeatureCollection
  const geojson = {
    type: 'FeatureCollection',
    features: data.slice(0, 10).map((place: any) => ({
      type: 'Feature',
      geometry: place.geojson,
      properties: {
        name: place.display_name,
      },
    })),
  };

  return geojson;
}
