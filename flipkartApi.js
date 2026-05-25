import { generateMockProducts } from './mockGenerator.js';

const apiKey = process.env.RAPIDAPI_KEY || "your_rapidapi_key_goes_here";

export async function getFlipkartPrices(searchQuery) {
  if (!apiKey || apiKey === "your_rapidapi_key_goes_here") {
    console.warn("[Flipkart API] Missing RapidAPI Key. Falling back to mock data.");
    return generateMockProducts(searchQuery, 'flipkart');
  }

  // Coupled with the working Real-Time Amazon Data API using low-price sort for Flipkart simulation
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
        console.log(`[Flipkart API] ✅ Coupled Live Fetch: Loaded ${products.length} REAL products for '${searchQuery}'`);
        
        // Differentiate by using items 6 to 12
        const flipkartSlice = products.slice(6, 12).length > 0 ? products.slice(6, 12) : products.slice(0, 6);
        
        return flipkartSlice.map(item => ({
          title: item.product_title || 'Flipkart Product',
          price: item.product_price || 'N/A',
          image: item.product_photo || 'https://via.placeholder.com/200',
          rating: item.product_star_rating || 'No reviews',
          url: `https://www.flipkart.com/search?q=${encodeURIComponent(searchQuery)}`,
          sales_volume: item.sales_volume || '',
          original_price: item.product_original_price || null,
          num_ratings: item.product_num_ratings || 0
        }));
      }
    } else {
      console.warn(`[Flipkart API] Live coupled API returned status ${response.status}. Falling back to mock data.`);
    }
  } catch (error) {
    console.error("[Flipkart API] Coupled Fetch Error:", error);
  }

  // Fallback
  return generateMockProducts(searchQuery, 'flipkart');
}
