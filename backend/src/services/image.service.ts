import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

export const getDestinationImage = async (destination: string): Promise<string> => {
  if (!UNSPLASH_ACCESS_KEY) {
    // Fallback to a random travel-related image from Unsplash Source if no API key is provided
    return `https://source.unsplash.com/800x600/?${encodeURIComponent(destination)},travel`;
  }

  try {
    const response = await axios.get('https://api.unsplash.com/search/photos', {
      params: {
        query: `${destination} travel`,
        orientation: 'landscape',
        per_page: 1,
      },
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
      },
    });

    if (response.data.results && response.data.results.length > 0) {
      return response.data.results[0].urls.regular;
    }
  } catch (error) {
    console.error('Error fetching image from Unsplash:', error);
  }

  // Final fallback
  return `https://source.unsplash.com/800x600/?travel,landscape`;
};
