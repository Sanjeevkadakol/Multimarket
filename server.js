import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { getAmazonPrices } from './amazonApi.js';
import { getWalmartPrices } from './walmartApi.js';
import { getFlipkartPrices } from './flipkartApi.js';
import { getSnapdealPrices } from './snapdealApi.js';
import {
  getSearchCache,
  setSearchCache,
  getFavorites,
  addFavorite,
  removeFavorite,
  getAllFavoritesWithUsers,
  logPrice,
  upsertProduct,
  getProductDetails,
  verifyUser,
  registerUser,
  getPlatformId,
  addComparison,
  getComparisonsForProduct
} from './database.js';

const app = express();
const PORT = process.env.PORT || 3000;

function generateId(link, platform) {
  const str = link + platform;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return 'prod_' + Math.abs(hash);
}

app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mount frontend static dist folder
app.use(express.static(path.join(__dirname, 'frontend/dist')));

// Fallback index.html router or redirect directly to Vite dev server
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/dist/index.html'), (err) => {
    if (err) {
      res.redirect('http://localhost:5173');
    }
  });
});

// User authentication using the relational USERS table
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = verifyUser(email, password);
    if (user) {
      res.json({
        success: true,
        user: {
          user_id: user.user_id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } else {
      res.status(401).json({ error: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// User registration using the relational USERS table
app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  try {
    const userId = registerUser(name, email, password, 'user');
    res.json({
      success: true,
      message: 'Registration successful',
      user: {
        user_id: userId,
        name,
        email,
        role: 'user'
      }
    });
  } catch (error) {
    if (error.message && error.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'Email address is already registered' });
    }
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 1. Search Aggregator Endpoint with Caching & Price Tracking
app.get('/api/search', async (req, res) => {
  const query = req.query.q;
  if (!query) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  try {
    // Check SQLite cache first
    const cachedResults = getSearchCache(query);
    if (cachedResults) {
      return res.json({
        query,
        results: cachedResults,
        cached: true
      });
    }

    console.log(`[Cache Miss] Querying live APIs for '${query}'...`);
    const [amazon, walmart, flipkart, snapdeal] = await Promise.all([
      getAmazonPrices(query).catch(err => {
        console.error('Amazon error:', err);
        return [];
      }),
      getWalmartPrices(query).catch(err => {
        console.error('Walmart error:', err);
        return [];
      }),
      getFlipkartPrices(query).catch(err => {
        console.error('Flipkart error:', err);
        return [];
      }),
      getSnapdealPrices(query).catch(err => {
        console.error('Snapdeal error:', err);
        return [];
      })
    ]);

    // Generate IDs and upsert products into custom DB table
    const platforms = [
      { name: 'amazon', items: amazon },
      { name: 'walmart', items: walmart },
      { name: 'flipkart', items: flipkart },
      { name: 'snapdeal', items: snapdeal }
    ];

    platforms.forEach(p => {
      const platformId = getPlatformId(p.name);
      p.items.forEach(item => {
        const link = item.url || item.link || '#';
        item.id = generateId(link, p.name);
        
        let itemPrice = '0.00';
        if (item.price) {
          itemPrice = typeof item.price === 'object' ? (item.price.value || item.price.current_price || '0.00') : item.price;
        } else if (item.price_string) {
          itemPrice = item.price_string;
        }

        const productId = upsertProduct({
          id: item.id,
          title: item.title || 'Product',
          price: String(itemPrice),
          image: item.image,
          link: link,
          platform: p.name,
          rating: item.rating || 'No reviews',
          category: 'Electronics',
          brand: (item.title && item.title.split(' ')[0]) || 'Generic',
          description: `Compare prices and specifications for the premium ${item.title || 'Product'} on ${p.name.toUpperCase()}. Top quality deal.`
        });

        if (productId && platformId) {
          // Log each comparison record into the SQLite comparisons table mapping users, platforms and products
          addComparison({
            user_id: 2, // Standard user seeded by default
            product_id: productId,
            platform_id: platformId,
            price: String(itemPrice),
            availability: 'In Stock',
            product_url: link
          });
        }
      });
    });

    const results = { amazon, walmart, flipkart, snapdeal };

    platforms.forEach(p => {
      p.items.slice(0, 3).forEach(item => {
        const title = item.title || item.name || item.product_name;
        let price = 'N/A';
        if (item.price) {
          price = typeof item.price === 'object' ? (item.price.value || item.price.current_price) : item.price;
        } else if (item.price_string) {
          price = item.price_string;
        }
        if (title && price && price !== 'N/A') {
          logPrice(title, String(price), p.name);
        }
      });
    });

    res.json({
      query,
      results,
      cached: false
    });
  } catch (error) {
    console.error('Error in search endpoint:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 2. Favorites REST API Endpoints
app.get('/api/favorites', (req, res) => {
  const { user_id } = req.query;
  if (!user_id) {
    return res.status(400).json({ error: 'User ID query parameter is required' });
  }
  try {
    const list = getFavorites(user_id);
    res.json(list);
  } catch (error) {
    console.error('Failed to get favorites:', error);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

app.post('/api/favorites', (req, res) => {
  const { user_id, id, title, price, image, link, platform } = req.body;
  if (!user_id) {
    return res.status(400).json({ error: 'User ID is required' });
  }
  if (!id || !title) {
    return res.status(400).json({ error: 'ID and Title are required' });
  }

  try {
    addFavorite(user_id, { id, title, price, image, link, platform });
    res.json({ success: true, message: 'Added to favorites' });
  } catch (error) {
    console.error('Failed to save favorite:', error);
    res.status(500).json({ error: 'Failed to save favorite' });
  }
});

app.delete('/api/favorites/:id', (req, res) => {
  const { id } = req.params;
  const { user_id } = req.query;
  if (!id) {
    return res.status(400).json({ error: 'ID is required' });
  }
  if (!user_id) {
    return res.status(400).json({ error: 'User ID query parameter is required' });
  }

  try {
    removeFavorite(user_id, id);
    res.json({ success: true, message: 'Removed from favorites' });
  } catch (error) {
    console.error('Failed to remove favorite:', error);
    res.status(500).json({ error: 'Failed to remove favorite' });
  }
});

// Admin endpoint to get all wishlisted items with user metadata
app.get('/api/admin/favorites', (req, res) => {
  try {
    const list = getAllFavoritesWithUsers();
    res.json(list);
  } catch (error) {
    console.error('Failed to get all wishlists for admin:', error);
    res.status(500).json({ error: 'Failed to fetch admin wishlists' });
  }
});

// 3. Individual Product Details Endpoint (returns specifications & dynamic comparisons)
app.get('/api/products/:id', (req, res) => {
  const { id } = req.params;
  try {
    const details = getProductDetails(id);
    if (details) {
      // Query comparisons for product
      const comparisons = getComparisonsForProduct(details.product_id);
      res.json({
        ...details,
        comparisons: comparisons || []
      });
    } else {
      res.status(404).json({ error: 'Product specs not found in database table' });
    }
  } catch (error) {
    console.error('Failed to get product specifications:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
