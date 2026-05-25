import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'multimarket.db');
const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Enforce referential integrity (foreign keys)
db.pragma('foreign_keys = ON');

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS search_cache (
    query TEXT PRIMARY KEY,
    results TEXT,
    timestamp INTEGER
  );

  CREATE TABLE IF NOT EXISTS favorites (
    id TEXT PRIMARY KEY,
    title TEXT,
    price TEXT,
    image TEXT,
    link TEXT,
    platform TEXT,
    created_at INTEGER
  );

  CREATE TABLE IF NOT EXISTS price_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_title TEXT,
    price TEXT,
    platform TEXT,
    timestamp INTEGER
  );

  -- 1. USERS TABLE
  CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('admin', 'user')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- 2. PRODUCT TABLE
  CREATE TABLE IF NOT EXISTS products (
    product_id INTEGER PRIMARY KEY AUTOINCREMENT,
    id TEXT UNIQUE, -- for operational hash lookup compatibility
    product_name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    brand TEXT,
    image_url TEXT,
    image BLOB,
    price TEXT, -- compatibility
    rating TEXT, -- compatibility
    platform TEXT, -- compatibility
    link TEXT, -- compatibility
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- 3. PLATFORM TABLE
  CREATE TABLE IF NOT EXISTS platforms (
    platform_id INTEGER PRIMARY KEY AUTOINCREMENT,
    platform_name TEXT NOT NULL UNIQUE,
    website_url TEXT NOT NULL,
    logo_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- 4. CATEGORY TABLE
  CREATE TABLE IF NOT EXISTS categories (
    category_id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    product_id INTEGER,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
  );

  -- 5. COMPARISON TABLE
  CREATE TABLE IF NOT EXISTS comparisons (
    comparison_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    platform_id INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    availability TEXT NOT NULL,
    product_url TEXT NOT NULL,
    compared_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (platform_id) REFERENCES platforms(platform_id) ON DELETE CASCADE
  );
`);

// Seed default data
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
if (userCount === 0) {
  console.log('[Database] Seeding default users...');
  db.prepare(`
    INSERT INTO users (name, email, password, role)
    VALUES ('Admin User', 'admin@multimarket.com', 'admin123', 'admin')
  `).run();
  db.prepare(`
    INSERT INTO users (name, email, password, role)
    VALUES ('Standard User', 'user@multimarket.com', 'user123', 'user')
  `).run();
}

const platformCount = db.prepare('SELECT COUNT(*) as count FROM platforms').get().count;
if (platformCount === 0) {
  console.log('[Database] Seeding default platforms...');
  db.prepare(`
    INSERT INTO platforms (platform_name, website_url, logo_url)
    VALUES ('amazon', 'https://www.amazon.com', 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg')
  `).run();
  db.prepare(`
    INSERT INTO platforms (platform_name, website_url, logo_url)
    VALUES ('walmart', 'https://www.walmart.com', 'https://upload.wikimedia.org/wikipedia/commons/c/ca/Walmart_logo.svg')
  `).run();
  db.prepare(`
    INSERT INTO platforms (platform_name, website_url, logo_url)
    VALUES ('flipkart', 'https://www.flipkart.com', 'https://upload.wikimedia.org/wikipedia/commons/7/7a/Flipkart_logo.png')
  `).run();
}

// Ensure snapdeal is seeded dynamically
const snapdealExists = db.prepare("SELECT COUNT(*) as count FROM platforms WHERE platform_name = 'snapdeal' COLLATE NOCASE").get().count;
if (snapdealExists === 0) {
  console.log('[Database] Seeding Snapdeal platform...');
  db.prepare(`
    INSERT INTO platforms (platform_name, website_url, logo_url)
    VALUES ('snapdeal', 'https://www.snapdeal.com', 'https://upload.wikimedia.org/wikipedia/commons/b/b2/Snapdeal_Logo.svg')
  `).run();
}

const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

export function getSearchCache(query) {
  const normalizedQuery = query.trim().toLowerCase();
  const stmt = db.prepare('SELECT results, timestamp FROM search_cache WHERE query = ?');
  const row = stmt.get(normalizedQuery);
  
  if (row) {
    const age = Date.now() - row.timestamp;
    if (age < CACHE_EXPIRY_MS) {
      try {
        console.log(`[Cache Hit] Serving '${query}' from database (Age: ${(age / 3600000).toFixed(2)}h)`);
        return JSON.parse(row.results);
      } catch (err) {
        console.error('Error parsing cached JSON:', err);
      }
    } else {
      console.log(`[Cache Expired] Removing expired cache for '${query}'`);
      db.prepare('DELETE FROM search_cache WHERE query = ?').run(normalizedQuery);
    }
  }
  return null;
}

export function setSearchCache(query, results) {
  const normalizedQuery = query.trim().toLowerCase();
  const stmt = db.prepare('INSERT OR REPLACE INTO search_cache (query, results, timestamp) VALUES (?, ?, ?)');
  stmt.run(normalizedQuery, JSON.stringify(results), Date.now());
  console.log(`[Cache Set] Cached '${query}' results in database`);
}

export function getFavorites() {
  const stmt = db.prepare('SELECT * FROM favorites ORDER BY created_at DESC');
  return stmt.all();
}

export function addFavorite(item) {
  const { id, title, price, image, link, platform } = item;
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO favorites (id, title, price, image, link, platform, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(id, title, price, image, link, platform, Date.now());
  console.log(`[Database] Added favorite: ${title}`);
}

export function removeFavorite(id) {
  const stmt = db.prepare('DELETE FROM favorites WHERE id = ?');
  stmt.run(id);
  console.log(`[Database] Removed favorite ID: ${id}`);
}

export function logPrice(productTitle, price, platform) {
  const stmt = db.prepare(`
    INSERT INTO price_history (product_title, price, platform, timestamp)
    VALUES (?, ?, ?, ?)
  `);
  stmt.run(productTitle, price, platform, Date.now());
}

function generateRichDetails(title, category, platform) {
  const name = title.toLowerCase();
  let specs = {};
  let reviews = [];
  
  const watchKeywords = [
    'watch', 'wearable', 'smartwatch', 'band', 'fitbit', 'garmin', 'apple watch', 'galaxy watch',
    'dial', 'wrist', 'timepiece', 'chronograph'
  ];
  const phoneKeywords = [
    'phone', 'iphone', 'samsung', 'mobile', 'cellular', 'cellphone', 'smartphone', '5g', '4g',
    'lava', 'agni', 'oneplus', 'pixel', 'moto', 'motorola', 'nokia', 'xiaomi', 'redmi', 'oppo', 
    'vivo', 'realme', 'asus', 'sony', 'lg', 'galaxy', 'nord', 'poco', 'infinix', 'tecno', 'micromax',
    'nothing', 'cmf', 'iqoo', 'honor', 'huawei'
  ];
  const laptopKeywords = [
    'laptop', 'macbook', 'computer', 'notebook', 'chromebook', 'ultrabook', 'thinkpad', 'zenbook', 
    'inspiron', 'pavilion', 'hp', 'dell', 'lenovo', 'acer', 'mac', 'desktop'
  ];
  const audioKeywords = [
    'headphone', 'earphone', 'audio', 'speaker', 'buds', 'airpods', 'soundbar', 'headset', 'earbuds', 
    'noise-cancelling', 'anc', 'jbl', 'bose', 'boat', 'noise'
  ];

  if (watchKeywords.some(keyword => name.includes(keyword))) {
    specs = {
      "Display": "1.43-inch AMOLED, Always-On (AOD), 466x466 px, 1000 nits Peak",
      "Health Tracking": "24/7 Heart Rate, SpO2 Blood Oxygen, Sleep Analyzer & Stress Monitor",
      "Sports Modes": "110+ Workout Modes, Built-in Multi-System GPS tracking",
      "Battery Life": "Up to 14 Days (Typical usage) / 7 Days (Heavy usage)",
      "Build & Protection": "IP68 Dust & Waterproof, 5ATM Swim-proof, Stainless Steel Case",
      "Connectivity": "Bluetooth 5.2, Bluetooth Calling support with Mic & Speaker",
      "Sensors": "Accelerometer, Gyroscope, Optical Heart Rate, Altimeter, Barometer",
      "Compatibility": "Compatible with Android 8.0+ and iOS 13.0+ (via Companion App)"
    };
    reviews = [
      { stars: 5, comment: "Beautiful display, very bright even in direct sunlight. Heart rate tracking is super accurate compared to medical devices.", author: "Amit Trivedi" },
      { stars: 4, comment: "Solid 10-day battery life. The Bluetooth calling feature works perfectly without lag.", author: "Ritu Singhal" },
      { stars: 5, comment: "Premium stainless steel design. Looks and feels like a luxury watch!", author: "Sanjay Dutta" }
    ];
  } else if (phoneKeywords.some(keyword => name.includes(keyword))) {
    specs = {
      "Processor": "Premium Octa-Core 5G SoC",
      "Display": "6.7-inch AMOLED, 120Hz Refresh Rate",
      "Memory": "8GB / 12GB LPDDR5X RAM",
      "Storage": "128GB / 256GB UFS 4.0 Storage",
      "Rear Camera": "50MP Main + 12MP Ultra-Wide + 8MP Telephoto",
      "Front Camera": "32MP Selfie Camera with Auto-Focus",
      "Battery": "5000 mAh with 67W HyperCharging Support",
      "OS": "Latest OS with Brand Premium UI Skin"
    };
    reviews = [
      { stars: 5, comment: "Mind-blowing performance and ultra-fast charging! Highly recommend it.", author: "Rahul Sharma" },
      { stars: 4, comment: "Excellent camera details and vibrant screen, though battery is just average.", author: "Priya Patel" },
      { stars: 5, comment: "Best in hand feel. The sliding 120Hz display is extremely smooth.", author: "Aman Verma" }
    ];
  } else if (laptopKeywords.some(keyword => name.includes(keyword))) {
    specs = {
      "Processor": "High Performance i7 / M-Series CPU",
      "Graphics": "Next-Gen Integrated Ultra HD Graphics",
      "Display": "15.6-inch Ultra-Clear IPS Panel (2560 x 1600)",
      "Memory": "16GB Dual-Channel DDR5 RAM",
      "Storage": "512GB PCIe Gen4 NVMe SSD",
      "Battery Life": "Up to 12 hours of high-productivity work",
      "Ports": "2x Thunderbolt 4, 1x HDMI 2.1, SD Card Reader",
      "Weight": "Super-Lightweight 1.4 kg Aluminum Chassis"
    };
    reviews = [
      { stars: 5, comment: "Very fast laptop. Starts up in seconds. Ideal for developers.", author: "Vikram Malhotra" },
      { stars: 4, comment: "Stunning screen quality and premium build. Trackpad is huge and precise.", author: "Deepika Sen" },
      { stars: 5, comment: "Lightweight and powerful. The battery backup is a lifesaver.", author: "Siddharth Rao" }
    ];
  } else if (audioKeywords.some(keyword => name.includes(keyword))) {
    specs = {
      "Acoustic Driver": "40mm High-Resolution Dynamic Neodymium Drivers",
      "Active Noise Cancelling": "Up to 45dB Smart Hybrid ANC Technology",
      "Bluetooth Version": "Bluetooth 5.3 with Dual-Device Connection",
      "Battery Capacity": "Up to 40 hours of playtime (ANC OFF)",
      "Fast Charging": "10-min charge gives up to 5 hours playback",
      "Microphones": "4x Beamforming Mics with AI Call Noise Reduction",
      "Audio Codecs": "AAC, SBC, and Hi-Res Wireless Audio Support"
    };
    reviews = [
      { stars: 5, comment: "Studio grade sound isolation. You won't hear any background noise!", author: "Karan Johar" },
      { stars: 4, comment: "Solid deep bass response and clear vocals. Very comfortable on long trips.", author: "Anjali Gupta" },
      { stars: 5, comment: "Excellent build. The earcups are super soft and fit perfectly.", author: "Rohan Kapoor" }
    ];
  } else if (name.includes('shoe') || name.includes('sneaker') || name.includes('nike') || name.includes('adidas') || name.includes('puma') || name.includes('reebok') || name.includes('footwear')) {
    specs = {
      "Upper Material": "High-Breathability Engineered Mesh",
      "Sole Material": "Response Foam & Durable Rubber Outsole",
      "Cushioning": "Max Comfort Responsive Midsole Technology",
      "Closure Type": "Lace-Up Secure Fit Design",
      "Weight": "Superlight 260g (per shoe, size 8)",
      "Style": "Aesthetic Athletic Runner & Lifestyle Sneaker"
    };
    reviews = [
      { stars: 5, comment: "Incredibly comfortable and perfect for long runs! The fit is like a glove.", author: "Arjun Mehta" },
      { stars: 4, comment: "Super lightweight and looks amazing, but gets dirty easily.", author: "Sneha Reddy" }
    ];
  } else {
    specs = {
      "Product Quality": "Premium Grade QA Tested Materials",
      "Model Type": "Aggregator Certified Launch Edition",
      "Compatibility": "Universal System Ecosystem Sync Support",
      "Power Rating": "Energy Star Certified Efficiency Rating",
      "Warranty": "1-Year Extended Manufacturer Coverage"
    };
    reviews = [
      { stars: 5, comment: "Exceptional quality e-commerce deal. Fast shipment and safe box packaging.", author: "Rajesh Kumar" },
      { stars: 4, comment: "Very functional and matches descriptions perfectly. Will buy again.", author: "Neha Singh" }
    ];
  }

  return JSON.stringify({
    specs,
    reviews,
    summary: `Compare price and reviews for the premium ${title} on ${platform.toUpperCase()}. Top quality e-commerce product listings.`
  });
}

export function upsertProduct(product) {
  const { id, title, price, image, link, platform, rating, category, brand, description } = product;
  const richDesc = generateRichDetails(title, category || 'Electronics', platform);
  
  db.prepare(`
    INSERT OR REPLACE INTO products (
      id, product_name, category, description, brand, image_url, image, price, rating, platform, link
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    title,
    category || 'Electronics',
    richDesc,
    brand || (title.split(' ')[0]) || 'Generic',
    image,
    null,
    price || 'N/A',
    rating || 'No reviews',
    platform,
    link
  );

  const row = db.prepare('SELECT product_id FROM products WHERE id = ?').get(id);
  return row ? row.product_id : null;
}

export function getProductDetails(productId) {
  const stmt = db.prepare('SELECT * FROM products WHERE id = ?');
  return stmt.get(productId);
}

// Relational DB helpers
export function verifyUser(email, password) {
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
  const user = stmt.get(email);
  if (user && user.password === password) {
    return user;
  }
  return null;
}

export function registerUser(name, email, password, role = 'user') {
  const stmt = db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)');
  const result = stmt.run(name, email, password, role);
  return result.lastInsertRowid;
}

export function getPlatformId(name) {
  const stmt = db.prepare('SELECT platform_id FROM platforms WHERE platform_name = ? COLLATE NOCASE');
  const row = stmt.get(name);
  return row ? row.platform_id : null;
}

export function addComparison(comparison) {
  const { user_id, product_id, platform_id, price, availability, product_url } = comparison;
  
  let cleanPrice = 0.0;
  if (price) {
    const matched = String(price).replace(/[^0-9.]/g, '');
    cleanPrice = parseFloat(matched) || 0.0;
  }

  const stmt = db.prepare(`
    INSERT INTO comparisons (user_id, product_id, platform_id, price, availability, product_url)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  return stmt.run(user_id, product_id, platform_id, cleanPrice, availability || 'In Stock', product_url);
}

export function getComparisonsForProduct(productId) {
  const stmt = db.prepare(`
    SELECT c.*, p.platform_name, p.logo_url, p.website_url
    FROM comparisons c
    JOIN platforms p ON c.platform_id = p.platform_id
    WHERE c.product_id = ?
    ORDER BY c.price ASC
  `);
  return stmt.all(productId);
}
