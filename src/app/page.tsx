'use client';

import { useState, useCallback } from 'react';
import Map from '@/components/Map';
import ChatPanel from '@/components/ChatPanel';
import type { LocationFeature } from '@/types/geojson';

export default function Home() {
  const [locations, setLocations] = useState<LocationFeature[]>([]);

  // Memoize the callback to prevent infinite loops
  const handleLocationsFound = useCallback((newLocations: LocationFeature[]) => {
    // Always replace old locations with new ones (clears old locations)
    setLocations(() => newLocations);
  }, []);

  return (
    <div className="h-screen flex">
      
      <div className="w-2/3">
        <Map locations={locations} />
      </div>
      <div className="w-1/3 border-l">
        <ChatPanel onLocationsFound={handleLocationsFound} />
      </div>
    </div>
  );
}
