interface ReviewRatingData {
  placeId?: string;
  name: string;
  address?: string;
  rating?: number;
  userRatingCount?: number;
}

interface ReviewRatingResult {
  success: boolean;
  data?: ReviewRatingData;
  error?: string;
}

/**
 * Get Google review ratings for a location using Google Places API (New)
 * @param locationName - Name of the location to search for
 * @returns Review rating data including rating and review count
 */
export async function getReviewRating(locationName: string): Promise<ReviewRatingResult> {
  try {
    // Note: You'll need to set GOOGLE_PLACES_API_KEY in your environment variables
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    
    if (!apiKey) {
      throw new Error('Google Places API key not configured. Please set GOOGLE_PLACES_API_KEY environment variable.');
    }

    // Step 1: Text search using Places API (New)
    const searchUrl = 'https://places.googleapis.com/v1/places:searchText';
    
    // Add timeout to prevent hanging requests
    const searchController = new AbortController();
    const searchTimeout = setTimeout(() => searchController.abort(), 10000); // 10 second timeout
    
    let searchRes;
    try {
      searchRes = await fetch(searchUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount',
        },
        body: JSON.stringify({
          textQuery: `${locationName} Singapore`,
          maxResultCount: 1,
        }),
        signal: searchController.signal,
      });
    } finally {
      clearTimeout(searchTimeout);
    }

    if (!searchRes.ok) {
      const errorText = await searchRes.text();
      throw new Error(`Google Places API (New) search error: ${searchRes.status} - ${errorText}`);
    }

    const searchData = await searchRes.json();
    
    if (!searchData.places || searchData.places.length === 0) {
      return {
        success: false,
        error: `No results found for "${locationName}"`,
      };
    }

    const place = searchData.places[0];
    const placeId = place.id;

    // Step 2: Get detailed place information including reviews using Places API (New)
    const detailsUrl = `https://places.googleapis.com/v1/places/${placeId}`;
    
    // Add timeout to prevent hanging requests
    const detailsController = new AbortController();
    const detailsTimeout = setTimeout(() => detailsController.abort(), 10000); // 10 second timeout
    
    let detailsRes;
    try {
      detailsRes = await fetch(detailsUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'id,displayName,formattedAddress,rating,userRatingCount',
        },
        signal: detailsController.signal,
      });
    } finally {
      clearTimeout(detailsTimeout);
    }

    if (!detailsRes.ok) {
      const errorText = await detailsRes.text();
      throw new Error(`Google Places API (New) details error: ${detailsRes.status} - ${errorText}`);
    }

    const result = await detailsRes.json();

    // Extract review rating information from Places API (New) format
    // Use result data if available, otherwise fall back to place data from search
    const finalData = result || place;
    
    const reviewData: ReviewRatingData = {
      placeId: finalData.id || placeId,
      name: finalData.displayName?.text || locationName,
      address: finalData.formattedAddress,
      rating: finalData.rating,
      userRatingCount: finalData.userRatingCount,
    };

    return {
      success: true,
      data: reviewData,
    };
  } catch (error) {
    // Handle timeout and abort errors
    if (error instanceof Error) {
      if (error.name === 'AbortError' || error.message.includes('aborted')) {
        return {
          success: false,
          error: 'Request timed out. Please try again.',
        };
      }
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: 'Unknown error occurred',
    };
  }
}

