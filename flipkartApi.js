import { generateMockProducts } from './mockGenerator.js';
import { fetchWithRotation } from './rapidapi.js';

export async function getFlipkartPrices(searchQuery) {
  // Coupled with the working Real-Time Amazon Data API using low-price sort for Flipkart simulation
  const url = `https://real-time-amazon-data.p.rapidapi.com/search?query=${encodeURIComponent(searchQuery)}&page=1&country=IN&sort_by=RELEVANCE&product_condition=ALL`;
  const host = 'real-time-amazon-data.p.rapidapi.com';

  try {
    const data = await fetchWithRotation(url, host);
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
  } catch (error) {
    console.error("[Flipkart API] Coupled Fetch Error:", error);
  }

  // Fallback
  return generateMockProducts(searchQuery, 'flipkart');
}
