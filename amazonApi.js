import { generateMockProducts } from './mockGenerator.js';

const apiKey = process.env.RAPIDAPI_KEY || "your_rapidapi_key_goes_here";

export async function getAmazonPrices(searchQuery) {
  if (!apiKey || apiKey === 'your_rapidapi_key_goes_here') {
    console.warn("[Amazon API] Missing RapidAPI Key! Falling back to mock data.");
    return generateMockProducts(searchQuery, 'amazon');
  }

  const url = `https://real-time-amazon-data.p.rapidapi.com/search?query=${encodeURIComponent(searchQuery)}&page=1&country=IN&sort_by=RELEVANCE&product_condition=ALL`;
  const options = {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': apiKey,
      'X-RapidAPI-Host': 'real-time-amazon-data.p.rapidapi.com'
    }
  };

  try {
    const response = await fetch(url, options);
    if (response.status === 200) {
      const data = await response.json();
      const products = data?.data?.products;

      if (products && products.length > 0) {
        console.log(`[Amazon API] ✅ Fetched ${products.length} REAL products for '${searchQuery}'`);
        
        // Normalize to our standard card format
        return products.slice(0, 6).map(item => ({
          title: item.product_title || 'Amazon Product',
          price: item.product_price || 'N/A',
          image: item.product_photo || 'https://via.placeholder.com/200',
          rating: item.product_star_rating || 'No reviews',
          url: item.product_url || `https://www.amazon.in/s?k=${encodeURIComponent(searchQuery)}`,
          sales_volume: item.sales_volume || '',
          is_prime: item.is_prime || false,
          original_price: item.product_original_price || null,
          num_ratings: item.product_num_ratings || 0
        }));
      }
    } else {
      console.warn(`[Amazon API] Server returned status ${response.status}. Falling back to mock data.`);
    }
  } catch (error) {
    console.error("[Amazon API] Error fetching live prices:", error);
  }

  // Fallback
  return generateMockProducts(searchQuery, 'amazon');
}
