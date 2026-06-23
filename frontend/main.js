import * as THREE from 'three';
import { Effect, EffectComposer, EffectPass, RenderPass } from 'postprocessing';
import { gsap } from 'gsap';

const API_BASE_URL = 'http://localhost:3000';

// Global state for tracked favorites
let favoritesList = [];

// DOM Elements
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const loadingSpinner = document.getElementById('loading');
const resultsGrid = document.getElementById('results');

const amazonList = document.getElementById('amazon-list');
const walmartList = document.getElementById('walmart-list');
const flipkartList = document.getElementById('flipkart-list');
const snapdealList = document.getElementById('snapdeal-list');

const favoritesGrid = document.getElementById('favorites-grid');
const tabButtons = document.querySelectorAll('.tab-btn');
const viewPanels = document.querySelectorAll('.view-panel');

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  initNavigation();
  initMagneticNav();
  loadFavorites(); // Preload favorites cache
  initAuthEvents();
  initPasswordToggle();
  initLoginDotMap();
  initModalEvents();
  initCarouselEvents();
  initRippleBackground();
  initWordRotator();
  initRedirectionDashboard();
  initPixelBlast();

  initMagicBento();
});

// Switch Tabs/Views
function initNavigation() {
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetView = btn.getAttribute('data-target');
      
      // Update Tab Buttons
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Update View Panels
      viewPanels.forEach(panel => {
        if (panel.id === targetView) {
          panel.classList.add('active');
        } else {
          panel.classList.remove('active');
        }
      });

      // Load Favorites if clicking wishlist tab
      if (targetView === 'favorites-view') {
        renderFavoritesPage();
      }

      // Render redirection graph if clicking profile/analysis tab
      if (targetView === 'profile-view') {
        renderRedirectionGraph();
      }
    });
  });
}

searchButton.addEventListener('click', performSearch);
searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    performSearch();
  }
});

async function performSearch() {
  const query = searchInput.value.trim();
  if (!query) return;

  // Collapse landing carousel smoothly
  const carousel = document.getElementById('landing-carousel');
  if (carousel) {
    carousel.classList.add('collapsed');
  }

  // Reset UI states
  loadingSpinner.classList.add('active');
  resultsGrid.classList.remove('visible');
  amazonList.innerHTML = '';
  walmartList.innerHTML = '';
  flipkartList.innerHTML = '';
  snapdealList.innerHTML = '';

  try {
    const response = await fetch(`${API_BASE_URL}/api/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error('Search failed');
    }
    const data = await response.json();
    
    // Refresh favorites list before rendering cards to ensure correct heart states
    await loadFavorites();

    renderResults('amazon', data.results.amazon, amazonList);
    renderResults('walmart', data.results.walmart, walmartList);
    renderResults('flipkart', data.results.flipkart, flipkartList);
    renderResults('snapdeal', data.results.snapdeal, snapdealList);
    
    resultsGrid.classList.add('visible');

  } catch (error) {
    console.error('Error during search:', error);
    alert('Failed to retrieve data. Make sure the backend server is running and your API keys are configured.');
  } finally {
    loadingSpinner.classList.remove('active');
  }
}

async function loadFavorites() {
  const userId = localStorage.getItem('multimarket_user_id');
  if (!userId) return;
  try {
    const res = await fetch(`${API_BASE_URL}/api/favorites?user_id=${userId}`);
    if (res.ok) {
      favoritesList = await res.json();
    }
  } catch (err) {
    console.error('Failed to pre-fetch favorites:', err);
  }
}

function generateId(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return 'prod_' + Math.abs(hash);
}

function renderResults(platform, items, container) {
  if (!items || items.length === 0) {
    container.innerHTML = '<div class="no-results">No products found.</div>';
    return;
  }

  items.forEach(item => {
    // Normalize data structures
    const title = item.title || item.name || item.product_name || 'Product';
    let price = 'N/A';
    if (item.price) {
      if (typeof item.price === 'object') {
        price = item.price.value ? `${item.price.currency || '$'}${item.price.value}` : item.price.current_price || 'N/A';
      } else {
        price = item.price;
      }
    } else if (item.price_string) {
      price = item.price_string;
    }

    // Convert USD to INR if necessary and format beautifully in Rupee layout
    if (typeof price === 'string' && price.startsWith('$')) {
      const usdValue = parseFloat(price.replace(/[^0-9.]/g, ''));
      if (!isNaN(usdValue)) {
        price = `₹${Math.round(usdValue * 83).toLocaleString('en-IN')}`;
      }
    } else if (typeof price === 'string' && !price.startsWith('₹') && price !== 'N/A') {
      const val = parseFloat(price.replace(/[^0-9.]/g, ''));
      if (!isNaN(val)) {
        price = `₹${Math.round(val).toLocaleString('en-IN')}`;
      }
    }

    const image = item.image || (item.images && item.images[0]) || (item.image && item.image.imageUrl) || item.thumbnail || 'https://via.placeholder.com/200';
    const rating = item.rating || item.stars || 'No reviews';
    const link = item.url || item.link || item.itemWebUrl || '#';
    const id = generateId(link + platform);

    const isFav = favoritesList.some(fav => fav.id === id);

    const card = document.createElement('div');
    card.className = 'product-card';
    card.setAttribute('data-id', id);

    card.innerHTML = `
      <button class="favorite-btn ${isFav ? 'active' : ''}" title="${isFav ? 'Remove from wishlist' : 'Save to wishlist'}">
        ❤️
      </button>
      <img src="${image}" alt="${title}" class="product-image" onerror="this.src='https://via.placeholder.com/200';">
      <div class="product-info">
        <h3 class="product-title">${title}</h3>
        <p class="product-price">${price}</p>
        <p class="product-rating">⭐ ${rating}</p>
      </div>
    `;

    // Click on card opens premium pop-up modal with specifications from SQLite DB
    card.addEventListener('click', async (e) => {
      // Prevent click triggers when clicking the heart button
      if (e.target.closest('.favorite-btn')) return;
      await openProductModal(id);
    });

    // Favorite heart button logic
    const favBtn = card.querySelector('.favorite-btn');
    favBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      await handleFavoriteToggle({ id, title, price, image, link, platform }, favBtn);
    });

    container.appendChild(card);
  });
}

async function handleFavoriteToggle(item, buttonEl) {
  const isAlreadyFav = buttonEl.classList.contains('active');
  const userId = localStorage.getItem('multimarket_user_id');
  if (!userId) {
    alert('Please log in first to wishlist products.');
    return;
  }

  try {
    if (isAlreadyFav) {
      // Remove from favorites
      const res = await fetch(`${API_BASE_URL}/api/favorites/${item.id}?user_id=${userId}`, { method: 'DELETE' });
      if (res.ok) {
        buttonEl.classList.remove('active');
        buttonEl.title = 'Save to wishlist';
        favoritesList = favoritesList.filter(f => f.id !== item.id);
      }
    } else {
      // Add to favorites
      const res = await fetch(`${API_BASE_URL}/api/favorites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, ...item })
      });
      if (res.ok) {
        buttonEl.classList.add('active');
        buttonEl.title = 'Remove from wishlist';
        favoritesList.push(item);
      }
    }
  } catch (err) {
    console.error('Failed to toggle favorite:', err);
  }
}

async function renderFavoritesPage() {
  const userRole = localStorage.getItem('multimarket_user_role');
  
  if (userRole === 'admin') {
    favoritesGrid.innerHTML = '<div class="loading-spinner active" style="position: static; transform: none; margin: 2rem auto;"></div>';
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/favorites`);
      if (!res.ok) throw new Error('Failed to fetch admin favorites');
      const allWishlists = await res.json();
      
      favoritesGrid.innerHTML = '';
      
      const sectionTitle = document.querySelector('#favorites-view .section-title');
      if (sectionTitle) {
        sectionTitle.textContent = 'Wishlist Master Logs (Admin Panel)';
      }
      
      if (allWishlists.length === 0) {
        favoritesGrid.innerHTML = '<div class="no-results">No wishlisted products found in the database.</div>';
        return;
      }
      
      // Render as a premium glassmorphic table
      const tableWrapper = document.createElement('div');
      tableWrapper.className = 'admin-table-wrapper';
      tableWrapper.innerHTML = `
        <table class="admin-wishlist-table">
          <thead>
            <tr>
              <th>User Details</th>
              <th>Product Image</th>
              <th>Product Details</th>
              <th>Platform</th>
              <th>Price</th>
              <th>Date Added</th>
            </tr>
          </thead>
          <tbody>
            ${allWishlists.map(item => {
              const formattedDate = new Date(item.created_at).toLocaleString();
              let priceStr = item.price || 'N/A';
              
              // Apply Currency Formatting to show Rupees cleanly if numeric
              if (typeof priceStr === 'string' && priceStr.startsWith('$')) {
                const usdValue = parseFloat(priceStr.replace(/[^0-9.]/g, ''));
                if (!isNaN(usdValue)) {
                  priceStr = `₹${Math.round(usdValue * 83).toLocaleString('en-IN')}`;
                }
              } else if (typeof priceStr === 'string' && !priceStr.startsWith('₹') && priceStr !== 'N/A') {
                const val = parseFloat(priceStr.replace(/[^0-9.]/g, ''));
                if (!isNaN(val)) {
                  priceStr = `₹${Math.round(val).toLocaleString('en-IN')}`;
                }
              }

              return `
                <tr>
                  <td>
                    <div class="admin-user-cell">
                      <span class="admin-user-name">${item.user_name}</span>
                      <span class="admin-user-email">${item.user_email}</span>
                    </div>
                  </td>
                  <td>
                    <img src="${item.image}" alt="${item.title}" class="admin-table-product-img" onerror="this.src='https://via.placeholder.com/200';">
                  </td>
                  <td>
                    <div class="admin-product-cell">
                      <a href="${item.link}" target="_blank" class="admin-product-link" onclick="trackRedirection('${item.platform}')">${item.title}</a>
                    </div>
                  </td>
                  <td>
                    <span class="platform-title ${item.platform.toLowerCase()}">${item.platform.toUpperCase()}</span>
                  </td>
                  <td class="admin-price-cell">${priceStr}</td>
                  <td class="admin-date-cell">${formattedDate}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      `;
      favoritesGrid.appendChild(tableWrapper);
    } catch (err) {
      console.error(err);
      favoritesGrid.innerHTML = '<div class="no-results" style="color: var(--primary);">Failed to load admin wishlist dashboard.</div>';
    }
    return;
  }

  const sectionTitle = document.querySelector('#favorites-view .section-title');
  if (sectionTitle) {
    sectionTitle.textContent = 'Saved Products';
  }

  await loadFavorites();
  favoritesGrid.innerHTML = '';

  if (favoritesList.length === 0) {
    favoritesGrid.innerHTML = '<div class="no-results">Your wishlist is empty. Try adding some items!</div>';
    return;
  }

  favoritesList.forEach(item => {
    const card = document.createElement('div');
    card.className = 'product-card';

    card.innerHTML = `
      <button class="favorite-btn active" title="Remove from wishlist">
        ❤️
      </button>
      <img src="${item.image}" alt="${item.title}" class="product-image" onerror="this.src='https://via.placeholder.com/200';">
      <div class="product-info">
        <span class="platform-title ${item.platform}" style="font-size: 0.8rem; font-weight: 700; text-transform: uppercase;">
          ${item.platform}
        </span>
        <h3 class="product-title" style="margin-top: 0.3rem;">${item.title}</h3>
        <p class="product-price">${item.price}</p>
      </div>
    `;

    card.addEventListener('click', async (e) => {
      if (e.target.closest('.favorite-btn')) return;
      await openProductModal(item.id);
    });

    const favBtn = card.querySelector('.favorite-btn');
    favBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      await handleFavoriteToggle(item, favBtn);
      renderFavoritesPage();
    });

    favoritesGrid.appendChild(card);
  });
}

// ==================== AUTHENTICATION & CAROUSEL & MODAL SYSTEM ====================

function handleLogout() {
  localStorage.removeItem('multimarket_login');
  localStorage.removeItem('multimarket_user');
  localStorage.removeItem('multimarket_user_id');
  localStorage.removeItem('multimarket_user_email');
  localStorage.removeItem('multimarket_user_role');

  // Re-enable the login dotmap animation
  initLoginDotMap();

  // Show the login overlay
  const loginOverlay = document.getElementById('login-overlay');
  if (loginOverlay) {
    loginOverlay.classList.add('active');
    loginOverlay.style.opacity = '';
  }

  // Clear query and search UI elements
  if (searchInput) searchInput.value = '';
  if (resultsGrid) resultsGrid.classList.remove('visible');
  const carousel = document.getElementById('landing-carousel');
  if (carousel) carousel.classList.remove('collapsed');

  // Reset navigation states back to Home view
  const tabs = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.view-panel');
  const heroSection = document.getElementById('hero-section');

  tabs.forEach(btn => {
    if (btn.getAttribute('data-target') === 'search-view') {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  const magneticTabs = document.querySelectorAll('.magnetic-tab');
  const magneticCursor = document.getElementById('magnetic-cursor');
  magneticTabs.forEach(tab => {
    if (tab.getAttribute('data-target') === 'search-view') {
      tab.classList.add('active');
      if (magneticCursor) {
        magneticCursor.style.width = `${tab.offsetWidth}px`;
        magneticCursor.style.left = `${tab.offsetLeft}px`;
        magneticCursor.style.opacity = '1';
      }
    } else {
      tab.classList.remove('active');
    }
  });

  panels.forEach(panel => {
    if (panel.id === 'search-view') {
      panel.classList.add('active');
    } else {
      panel.classList.remove('active');
    }
  });

  if (heroSection) {
    heroSection.style.display = 'flex';
  }
}

function checkAuth() {
  // Always force the login page to load first on fresh load/restart
  localStorage.removeItem('multimarket_login');
  localStorage.removeItem('multimarket_user');
  localStorage.removeItem('multimarket_user_id');
  localStorage.removeItem('multimarket_user_email');
  localStorage.removeItem('multimarket_user_role');
  
  const loggedIn = localStorage.getItem('multimarket_login');
  const loginOverlay = document.getElementById('login-overlay');
  if (loggedIn === 'true') {
    loginOverlay.classList.remove('active');
  } else {
    loginOverlay.classList.add('active');
  }
}

function initAuthEvents() {
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }

  const loginForm = document.getElementById('login-form');
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value.trim();
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });
      
      if (!response.ok) {
        throw new Error('Invalid email or password');
      }
      
      const data = await response.json();
      if (data.success) {
        localStorage.setItem('multimarket_login', 'true');
        localStorage.setItem('multimarket_user', data.user.name);
        localStorage.setItem('multimarket_user_id', data.user.user_id);
        localStorage.setItem('multimarket_user_email', data.user.email);
        localStorage.setItem('multimarket_user_role', data.user.role);
        
        // Resource cleanup: Clean up map animation when signed in
        const canvas = document.getElementById('login-dotmap-canvas');
        if (canvas && canvas._dotmapCleanup) {
          canvas._dotmapCleanup();
        }

        const loginOverlay = document.getElementById('login-overlay');
        loginOverlay.style.transition = 'opacity 0.4s ease';
        loginOverlay.style.opacity = '0';
        setTimeout(() => {
          loginOverlay.classList.remove('active');
          loginOverlay.style.opacity = '';
        }, 400);
      } else {
        alert('Authentication failed.');
      }
    } catch (err) {
      console.error('Login error:', err);
      alert('Login failed: ' + err.message + '\n\nPlease check your credentials or register a new account.');
    }
  });

  // Toggle modes between login and registration panels
  const linkToRegister = document.getElementById('link-to-register');
  const linkToLogin = document.getElementById('link-to-login');
  const loginWrapper = document.getElementById('login-form-wrapper');
  const registerWrapper = document.getElementById('register-form-wrapper');

  if (linkToRegister && linkToLogin && loginWrapper && registerWrapper) {
    linkToRegister.addEventListener('click', (e) => {
      e.preventDefault();
      loginWrapper.style.display = 'none';
      registerWrapper.style.display = 'block';
    });

    linkToLogin.addEventListener('click', (e) => {
      e.preventDefault();
      registerWrapper.style.display = 'none';
      loginWrapper.style.display = 'block';
    });
  }

  // Registration password eye visibility toggler
  const regPasswordToggle = document.getElementById('reg-password-toggle');
  const regPasswordInput = document.getElementById('reg-password');
  if (regPasswordToggle && regPasswordInput) {
    const eyeOpen = regPasswordToggle.querySelector('.eye-open');
    const eyeClosed = regPasswordToggle.querySelector('.eye-closed');

    regPasswordToggle.addEventListener('click', () => {
      const isPassword = regPasswordInput.type === 'password';
      regPasswordInput.type = isPassword ? 'text' : 'password';

      if (isPassword) {
        eyeOpen.style.display = 'none';
        eyeClosed.style.display = 'block';
      } else {
        eyeOpen.style.display = 'block';
        eyeClosed.style.display = 'none';
      }
    });
  }

  // Handle registration form submission
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('reg-name').value.trim();
      const email = document.getElementById('reg-email').value.trim();
      const password = document.getElementById('reg-password').value.trim();

      try {
        const response = await fetch(`${API_BASE_URL}/api/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Registration failed');
        }

        const data = await response.json();
        if (data.success) {
          localStorage.setItem('multimarket_login', 'true');
          localStorage.setItem('multimarket_user', data.user.name);
          localStorage.setItem('multimarket_user_id', data.user.user_id);
          localStorage.setItem('multimarket_user_email', data.user.email);
          localStorage.setItem('multimarket_user_role', data.user.role);

          // Resource cleanup: Clean up map animation when signed in
          const canvas = document.getElementById('login-dotmap-canvas');
          if (canvas && canvas._dotmapCleanup) {
            canvas._dotmapCleanup();
          }

          const loginOverlay = document.getElementById('login-overlay');
          loginOverlay.style.transition = 'opacity 0.4s ease';
          loginOverlay.style.opacity = '0';
          setTimeout(() => {
            loginOverlay.classList.remove('active');
            loginOverlay.style.opacity = '';
            registerForm.reset();
            // Reset to show login panel next time overlay is loaded
            if (loginWrapper && registerWrapper) {
              registerWrapper.style.display = 'none';
              loginWrapper.style.display = 'block';
            }
          }, 400);
        }
      } catch (err) {
        console.error('Registration error:', err);
        alert(err.message);
      }
    });
  }

  // Google Single Sign-on click simulation
  const googleBtn = document.getElementById('google-login-btn');
  if (googleBtn) {
    googleBtn.addEventListener('click', () => {
      alert('Google Single-Sign On is currently simulated. Please use standard registered credentials or create a new account.');
    });
  }

  // Forgot password help overlay
  const forgotLink = document.getElementById('forgot-password-link');
  if (forgotLink) {
    forgotLink.addEventListener('click', (e) => {
      e.preventDefault();
      alert('Password Recovery Info:\n\nPlease contact the administrator or register a new account if you do not have one.');
    });
  }
}

function initPasswordToggle() {
  const passwordToggle = document.getElementById('password-toggle');
  const passwordInput = document.getElementById('password');
  if (!passwordToggle || !passwordInput) return;

  const eyeOpen = passwordToggle.querySelector('.eye-open');
  const eyeClosed = passwordToggle.querySelector('.eye-closed');

  passwordToggle.addEventListener('click', () => {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';

    if (isPassword) {
      eyeOpen.style.display = 'none';
      eyeClosed.style.display = 'block';
    } else {
      eyeOpen.style.display = 'block';
      eyeClosed.style.display = 'none';
    }
  });
}

function initLoginDotMap() {
  const canvas = document.getElementById('login-dotmap-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let dots = [];
  let startTime = Date.now();
  let animationFrameId;

  // Paths mapping connecting travelers/products
  const routes = [
    {
      start: { x: 0.25, y: 0.35, delay: 0 },
      end: { x: 0.5, y: 0.25, delay: 2.2 },
      color: 'rgba(99, 102, 241, 0.7)'
    },
    {
      start: { x: 0.5, y: 0.25, delay: 2.2 },
      end: { x: 0.68, y: 0.35, delay: 4.5 },
      color: 'rgba(99, 102, 241, 0.7)'
    },
    {
      start: { x: 0.125, y: 0.15, delay: 1 },
      end: { x: 0.38, y: 0.5, delay: 3.5 },
      color: 'rgba(236, 72, 153, 0.7)'
    },
    {
      start: { x: 0.75, y: 0.2, delay: 0.5 },
      end: { x: 0.48, y: 0.55, delay: 3 },
      color: 'rgba(99, 102, 241, 0.7)'
    }
  ];

  function resize() {
    const parent = canvas.parentElement;
    if (!parent) return;
    width = parent.clientWidth;
    height = parent.clientHeight;
    canvas.width = width;
    canvas.height = height;
    generateDots();
  }

  function generateDots() {
    dots = [];
    const gap = 12;
    const dotRadius = 1.25;

    for (let x = 0; x < width; x += gap) {
      for (let y = 0; y < height; y += gap) {
        // Shapes modeled after continents on a grid map
        const isInMapShape =
          // North America
          ((x < width * 0.3 && x > width * 0.05) && (y < height * 0.45 && y > height * 0.1)) ||
          // South America
          ((x < width * 0.3 && x > width * 0.18) && (y < height * 0.85 && y > height * 0.45)) ||
          // Europe
          ((x < width * 0.52 && x > width * 0.35) && (y < height * 0.4 && y > height * 0.15)) ||
          // Africa
          ((x < width * 0.58 && x > width * 0.4) && (y < height * 0.75 && y > height * 0.4)) ||
          // Asia
          ((x < width * 0.85 && x > width * 0.52) && (y < height * 0.55 && y > height * 0.1)) ||
          // Australia
          ((x < width * 0.95 && x > width * 0.78) && (y < height * 0.85 && y > height * 0.65));

        if (isInMapShape && Math.random() > 0.35) {
          dots.push({
            x,
            y,
            radius: dotRadius,
            opacity: Math.random() * 0.45 + 0.15
          });
        }
      }
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    // Render dot clusters
    dots.forEach(dot => {
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${dot.opacity})`;
      ctx.fill();
    });

    // Compute route path progress
    const currentTime = (Date.now() - startTime) / 1000;

    routes.forEach(route => {
      const elapsed = currentTime - route.start.delay;
      if (elapsed <= 0) return;

      const duration = 3.5;
      const progress = Math.min(elapsed / duration, 1);

      const startX = route.start.x * width;
      const startY = route.start.y * height;
      const endX = route.end.x * width;
      const endY = route.end.y * height;

      const x = startX + (endX - startX) * progress;
      const y = startY + (endY - startY) * progress;

      // Draw path connector
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = route.color;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Draw starting node indicator
      ctx.beginPath();
      ctx.arc(startX, startY, 3, 0, Math.PI * 2);
      ctx.fillStyle = route.color;
      ctx.fill();

      // Draw glowing traveler particle
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(99, 102, 241, 0.4)';
      ctx.fill();

      if (progress === 1) {
        ctx.beginPath();
        ctx.arc(endX, endY, 3, 0, Math.PI * 2);
        ctx.fillStyle = route.color;
        ctx.fill();
      }
    });

    // Reset loop after 12s
    if (currentTime > 12) {
      startTime = Date.now();
    }

    animationFrameId = requestAnimationFrame(draw);
  }

  const resizeObserver = new ResizeObserver(() => {
    resize();
  });
  resizeObserver.observe(canvas.parentElement);
  resize();
  draw();

  // Attach memory leak protection cleanup
  canvas._dotmapCleanup = () => {
    cancelAnimationFrame(animationFrameId);
    resizeObserver.disconnect();
  };
}

function initCarouselEvents() {
  const slides = document.querySelectorAll('.carousel-slide');
  slides.forEach(slide => {
    slide.addEventListener('click', () => {
      const category = slide.querySelector('h4').textContent;
      searchInput.value = category;
      performSearch();
    });
  });
}

function initModalEvents() {
  const modal = document.getElementById('product-modal');
  const closeBtn = document.getElementById('modal-close-btn');
  
  closeBtn.addEventListener('click', () => {
    modal.classList.remove('active');
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  });
}

async function openProductModal(productId) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/products/${productId}`);
    if (!res.ok) {
      throw new Error('Specs not found');
    }
    const product = await res.json();
    
    // Parse description JSON to extract specifications and reviews
    let parsedDescription = {
      summary: product.description,
      specs: {},
      reviews: []
    };

    try {
      if (product.description && (product.description.startsWith('{') || product.description.startsWith('['))) {
        parsedDescription = JSON.parse(product.description);
      }
    } catch (err) {
      console.warn("Description is not JSON:", err);
    }
    
    document.getElementById('modal-product-image').src = product.image_url || 'https://via.placeholder.com/200';
    document.getElementById('modal-product-name').textContent = product.product_name;
    document.getElementById('modal-product-brand').textContent = product.brand || 'Generic';
    document.getElementById('modal-product-category').textContent = product.category || 'Electronics';
    
    // Normalize and convert price for details display
    let priceDisplay = product.price || 'N/A';
    if (typeof priceDisplay === 'string' && priceDisplay.startsWith('$')) {
      const usdValue = parseFloat(priceDisplay.replace(/[^0-9.]/g, ''));
      if (!isNaN(usdValue)) {
        priceDisplay = `₹${Math.round(usdValue * 83).toLocaleString('en-IN')}`;
      }
    } else if (typeof priceDisplay === 'string' && !priceDisplay.startsWith('₹') && priceDisplay !== 'N/A') {
      const val = parseFloat(priceDisplay.replace(/[^0-9.]/g, ''));
      if (!isNaN(val)) {
        priceDisplay = `₹${Math.round(val).toLocaleString('en-IN')}`;
      }
    }
    document.getElementById('modal-product-price').textContent = priceDisplay;
    
    document.getElementById('modal-product-rating').textContent = `⭐ ${product.rating || 'No reviews'}`;
    document.getElementById('modal-product-description').textContent = parsedDescription.summary || product.description;
    
    const badge = document.getElementById('modal-product-platform');
    badge.className = `platform-badge ${product.platform}`;
    badge.textContent = product.platform;

    const linkEl = document.getElementById('modal-product-link');
    linkEl.href = product.link || '#';
    linkEl.onclick = () => { trackRedirection(product.platform); };

    const wishlistBtn = document.getElementById('modal-wishlist-btn');
    const isFav = favoritesList.some(fav => fav.id === product.id);
    wishlistBtn.innerHTML = isFav ? '❤️ Saved to Wishlist' : '🤍 Save to Wishlist';
    
    wishlistBtn.onclick = async (e) => {
      e.stopPropagation();
      const mockEl = document.querySelector(`.product-card[data-id="${product.id}"] .favorite-btn`);
      await handleFavoriteToggle({
        id: product.id,
        title: product.product_name,
        price: product.price,
        image: product.image_url,
        link: product.link,
        platform: product.platform
      }, mockEl || document.createElement('button'));
      
      const nowFav = favoritesList.some(fav => fav.id === product.id);
      wishlistBtn.innerHTML = nowFav ? '❤️ Saved to Wishlist' : '🤍 Save to Wishlist';
    };

    // Render Specifications Grid in popup modal
    const specsContainerId = 'modal-product-specs-list';
    let specsEl = document.getElementById(specsContainerId);
    if (!specsEl) {
      specsEl = document.createElement('div');
      specsEl.id = specsContainerId;
      specsEl.style.marginTop = '1rem';
      specsEl.style.display = 'grid';
      specsEl.style.gridTemplateColumns = 'repeat(auto-fit, minmax(200px, 1fr))';
      specsEl.style.gap = '0.8rem';
      document.getElementById('modal-product-description').parentNode.appendChild(specsEl);
    }
    specsEl.innerHTML = '';
    
    if (parsedDescription.specs && Object.keys(parsedDescription.specs).length > 0) {
      Object.entries(parsedDescription.specs).forEach(([key, value]) => {
        const item = document.createElement('div');
        item.style.background = 'rgba(99, 102, 241, 0.05)';
        item.style.padding = '0.6rem 0.8rem';
        item.style.borderRadius = '6px';
        item.style.borderLeft = '3px solid var(--primary)';
        item.innerHTML = `<span style="font-size: 0.72rem; color: var(--text-muted); display: block; text-transform: uppercase; margin-bottom: 0.15rem;">${key}</span>
                          <strong style="font-size: 0.88rem; color: var(--text-main); font-weight: 600;">${value}</strong>`;
        specsEl.appendChild(item);
      });
    }

    // Render Customer Reviews inside specifications popup modal
    const reviewsContainerId = 'modal-product-reviews-section';
    let reviewsEl = document.getElementById(reviewsContainerId);
    if (!reviewsEl) {
      reviewsEl = document.createElement('div');
      reviewsEl.id = reviewsContainerId;
      reviewsEl.style.marginTop = '1.5rem';
      reviewsEl.style.borderTop = '1px solid var(--border)';
      reviewsEl.style.paddingTop = '1.5rem';
      document.getElementById('modal-product-description').parentNode.appendChild(reviewsEl);
    }
    reviewsEl.innerHTML = '<h3 style="margin-bottom: 1rem; font-size: 1.1rem; color: var(--text-main);">Customer Reviews</h3>';
    
    const reviewsGrid = document.createElement('div');
    reviewsGrid.style.display = 'flex';
    reviewsGrid.style.flexDirection = 'column';
    reviewsGrid.style.gap = '0.8rem';
    
    if (parsedDescription.reviews && parsedDescription.reviews.length > 0) {
      parsedDescription.reviews.forEach(rev => {
        const card = document.createElement('div');
        card.style.background = 'rgba(15, 23, 42, 0.02)';
        card.style.padding = '0.8rem 1rem';
        card.style.borderRadius = '8px';
        card.style.border = '1px solid var(--border)';
        
        let starsStr = '⭐'.repeat(rev.stars);
        card.innerHTML = `
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.4rem;">
            <strong style="color: var(--primary); font-size: 0.9rem;">${rev.author}</strong>
            <span style="font-size: 0.8rem;">${starsStr}</span>
          </div>
          <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.4; margin: 0; font-style: italic;">"${rev.comment}"</p>
        `;
        reviewsGrid.appendChild(card);
      });
      reviewsEl.appendChild(reviewsGrid);
    } else {
      reviewsEl.innerHTML += '<div style="color: var(--text-muted); font-size: 0.9rem; font-style: italic;">No reviews indexed for this item yet.</div>';
    }

    // Render relational comparative prices from the SQLite comparisons table
    const compContainer = document.getElementById('modal-comparisons-table');
    if (compContainer) {
      compContainer.innerHTML = '';
      if (product.comparisons && product.comparisons.length > 0) {
        const uniqueComps = {};
        product.comparisons.forEach(c => {
          const plat = c.platform_name.toLowerCase();
          if (!uniqueComps[plat] || new Date(c.compared_at) > new Date(uniqueComps[plat].compared_at)) {
            uniqueComps[plat] = c;
          }
        });

        Object.values(uniqueComps).forEach(c => {
          const row = document.createElement('div');
          row.className = 'comparison-row';
          row.style.display = 'flex';
          row.style.justifyContent = 'space-between';
          row.style.alignItems = 'center';
          row.style.padding = '0.6rem 1rem';
          row.style.background = 'rgba(0, 0, 0, 0.02)';
          row.style.borderRadius = '8px';
          row.style.border = '1px solid var(--border)';
          
          row.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.6rem;">
              <span class="platform-title ${c.platform_name.toLowerCase()}" style="font-size: 0.8rem; font-weight: 700; text-transform: uppercase;">
                ${c.platform_name}
              </span>
              <span style="font-size: 0.8rem; color: var(--text-muted);">(${c.availability})</span>
            </div>
            <div style="display: flex; align-items: center; gap: 1rem;">
              <span style="font-weight: 700; color: var(--primary); font-size: 1.1rem;">₹${parseFloat(c.price).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <a href="${c.product_url}" target="_blank" class="modal-buy-btn" style="padding: 0.3rem 0.6rem; font-size: 0.75rem; border-radius: 6px;">Buy ↗</a>
            </div>
          `;
          const buyLink = row.querySelector('.modal-buy-btn');
          if (buyLink) {
            buyLink.onclick = () => { trackRedirection(c.platform_name); };
          }
          compContainer.appendChild(row);
        });
      } else {
        compContainer.innerHTML = '<div style="color: var(--text-muted); font-size: 0.9rem; font-style: italic;">No comparison platform matches indexed in the database yet. Run a fresh search first!</div>';
      }
    }

    document.getElementById('product-modal').classList.add('active');

  } catch (error) {
    console.error('Failed to open specifications modal:', error);
    alert('Product details could not be loaded from database. Please run search again.');
  }
}

// ==================== PREMIUM INTERACTIVE UI FUNCTIONS ====================

function initRippleBackground() {
  const container = document.getElementById('ripple-container');
  if (!container) return;

  // Handle user clicks on empty or non-blocking spaces
  document.addEventListener('click', (e) => {
    // Avoid creating ripples when clicking inputs or buttons/links to avoid interfering with form controls
    if (e.target.closest('input') || e.target.closest('button') || e.target.closest('a') || e.target.closest('.carousel-slide') || e.target.closest('.product-card')) {
      return;
    }

    createRipple(e.clientX, e.clientY);
  });

  // Helper function to create ripple DOM element
  function createRipple(x, y) {
    const ripple = document.createElement('div');
    ripple.className = 'ripple-effect';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;

    container.appendChild(ripple);

    // Remove element after 2 seconds to keep DOM light and fast
    setTimeout(() => {
      ripple.remove();
    }, 2000);
  }

  // Auto-generate ambient ripples around the screen for premium animated depth
  setInterval(() => {
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight;
    
    // Only generate ambient ripple if the window has focus and is not hidden
    if (!document.hidden) {
      createRipple(x, y);
    }
  }, 4000);
}

function initWordRotator() {
  const words = [
    "fancy ✨",
    "fun 💃",
    "lovely ♥",
    "weird 🪩",
    "funky 🕶️",
    "sexy 🕺",
    "cool 🚀",
    "pop ✨",
    "rock 🤘"
  ];
  let index = 0;
  const rotateWordEl = document.getElementById('rotate-word');
  if (!rotateWordEl) return;

  setInterval(() => {
    // Stage 1: Slide down and fade out
    rotateWordEl.style.transform = 'translateY(15px)';
    rotateWordEl.style.opacity = '0';

    setTimeout(() => {
      // Stage 2: Cycle word and reposition to top
      index = (index + 1) % words.length;
      rotateWordEl.textContent = words[index];
      rotateWordEl.style.transform = 'translateY(-15px)';

      // Stage 3: Slide down to center and fade in
      setTimeout(() => {
        rotateWordEl.style.transform = 'translateY(0)';
        rotateWordEl.style.opacity = '1';
      }, 50);
    }, 250);
  }, 3000);
}

function initMagneticNav() {
  const navContainer = document.getElementById('magnetic-nav');
  const cursor = document.getElementById('magnetic-cursor');
  const tabs = document.querySelectorAll('.magnetic-tab');
  
  if (!navContainer || !cursor) return;

  // Set initial position if active
  const activeTab = navContainer.querySelector('.magnetic-tab.active');
  if (activeTab) {
    cursor.style.width = `${activeTab.offsetWidth}px`;
    cursor.style.left = `${activeTab.offsetLeft}px`;
    cursor.style.opacity = '1';
  }

  tabs.forEach(tab => {
    tab.addEventListener('mouseenter', () => {
      cursor.style.width = `${tab.offsetWidth}px`;
      cursor.style.left = `${tab.offsetLeft}px`;
      cursor.style.opacity = '1';
    });
    
    tab.addEventListener('click', (e) => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const target = tab.getAttribute('data-target');
      const viewPanels = document.querySelectorAll('.view-panel');
      
      // Map 'about-view' and 'contact-view' to 'search-view' (Home tab)
      const actualViewTarget = (target === 'about-view' || target === 'contact-view') ? 'search-view' : target;
      
      // Update View Panels
      viewPanels.forEach(panel => {
        if (panel.id === actualViewTarget) {
          panel.classList.add('active');
        } else {
          panel.classList.remove('active');
        }
      });

      // Toggle Hero Section visibility:
      // Only show the Hero section when 'search-view' (Home) is active!
      const heroSection = document.getElementById('hero-section');
      if (heroSection) {
        if (actualViewTarget === 'search-view') {
          heroSection.style.display = 'flex';
        } else {
          heroSection.style.display = 'none';
        }
      }

      // Load Favorites if clicking wishlist tab
      if (target === 'favorites-view') {
        renderFavoritesPage();
      }

      // Load Profile metrics if clicking profile tab
      if (target === 'profile-view') {
        renderRedirectionGraph();
      }

      // Handle custom scrolling for 'About' and 'Contact' on Home page
      if (target === 'about-view' || target === 'contact-view') {
        const aboutSection = document.getElementById('about-us-section');
        if (aboutSection) {
          setTimeout(() => {
            aboutSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
        }
      } else {
        // Smooth scroll back to top of page
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  });

  navContainer.addEventListener('mouseleave', () => {
    // Reset to active tab
    const currentActive = navContainer.querySelector('.magnetic-tab.active');
    if (currentActive) {
      cursor.style.width = `${currentActive.offsetWidth}px`;
      cursor.style.left = `${currentActive.offsetLeft}px`;
      cursor.style.opacity = '1';
    } else {
      cursor.style.opacity = '0';
    }
  });
}

function showNavToast(pageName) {
  let toast = document.getElementById('nav-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'nav-toast';
    toast.style.position = 'fixed';
    toast.style.bottom = '2rem';
    toast.style.right = '2rem';
    toast.style.background = 'rgba(15, 23, 42, 0.9)';
    toast.style.color = '#ffffff';
    toast.style.padding = '0.8rem 1.5rem';
    toast.style.borderRadius = '12px';
    toast.style.fontSize = '0.9rem';
    toast.style.fontWeight = '600';
    toast.style.zIndex = '99999';
    toast.style.transition = 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
    toast.style.transform = 'translateY(100px)';
    toast.style.opacity = '0';
    toast.style.border = '1px solid rgba(255, 255, 255, 0.1)';
    toast.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
    toast.style.backdropFilter = 'blur(10px)';
    document.body.appendChild(toast);
  }
  toast.textContent = `Navigated to ${pageName} (Simulated View)`;
  toast.style.transform = 'translateY(0)';
  toast.style.opacity = '1';
  
  setTimeout(() => {
    toast.style.transform = 'translateY(100px)';
    toast.style.opacity = '0';
  }, 2500);
}

function animateProfileMetrics() {
  const metricElements = document.querySelectorAll('#profile-view .metric-number');
  metricElements.forEach(el => {
    const target = parseFloat(el.getAttribute('data-target'));
    const suffix = el.getAttribute('data-suffix') || '';
    const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
    
    // Reset to start state
    el.textContent = (0).toFixed(decimals) + suffix;
    
    let current = 0;
    const duration = 1600; // 1.6s duration
    const startTime = performance.now();
    
    function updateMetric(timestamp) {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out quad
      const easeProgress = progress * (2 - progress);
      const val = easeProgress * target;
      
      el.textContent = val.toFixed(decimals) + suffix;
      
      if (progress < 1) {
        requestAnimationFrame(updateMetric);
      }
    }
    
    // Small delay to let the page transition complete before counting up
    setTimeout(() => {
      requestAnimationFrame(updateMetric);
    }, 100);
  });
}

// ==================== MARKETPLACE REDIRECTION TRACKING & GRAPH ====================

function seedRedirectionStats() {
  const seeded = localStorage.getItem('multimarket_clicks_seeded');
  if (!seeded) {
    localStorage.setItem('multimarket_clicks_amazon', '18');
    localStorage.setItem('multimarket_clicks_walmart', '12');
    localStorage.setItem('multimarket_clicks_flipkart', '24');
    localStorage.setItem('multimarket_clicks_snapdeal', '6');
    localStorage.setItem('multimarket_clicks_seeded', 'true');
  }
}

function trackRedirection(platform) {
  if (!platform) return;
  const platKey = platform.toLowerCase().trim();
  const validPlatforms = ['amazon', 'walmart', 'flipkart', 'snapdeal'];
  if (!validPlatforms.includes(platKey)) return;

  const key = `multimarket_clicks_${platKey}`;
  const current = parseInt(localStorage.getItem(key) || '0', 10);
  localStorage.setItem(key, current + 1);
  console.log(`Tracked redirection to ${platform}. Total clicks: ${current + 1}`);

  // If the profile tab is active, instantly refresh the graph!
  const activeTab = document.querySelector('.magnetic-tab.active');
  if (activeTab && activeTab.getAttribute('data-target') === 'profile-view') {
    renderRedirectionGraph();
  }
}

function renderRedirectionGraph() {

  // Update username display and role in profile summary
  const usernameDisplay = document.getElementById('profile-username-display');
  if (usernameDisplay) {
    const email = localStorage.getItem('multimarket_user_email');
    const name = localStorage.getItem('multimarket_user');
    usernameDisplay.textContent = email || name || 'admin@multimarket.com';
  }

  const roleDisplay = document.querySelector('#profile-view .user-role-badge');
  if (roleDisplay) {
    const role = localStorage.getItem('multimarket_user_role') || 'admin';
    roleDisplay.textContent = role === 'admin' ? 'Premium Administrator' : 'Standard User';
  }

  const clicks = {
    amazon: parseInt(localStorage.getItem('multimarket_clicks_amazon') || '0', 10),
    walmart: parseInt(localStorage.getItem('multimarket_clicks_walmart') || '0', 10),
    flipkart: parseInt(localStorage.getItem('multimarket_clicks_flipkart') || '0', 10),
    snapdeal: parseInt(localStorage.getItem('multimarket_clicks_snapdeal') || '0', 10),
  };

  const total = clicks.amazon + clicks.walmart + clicks.flipkart + clicks.snapdeal;
  const max = Math.max(clicks.amazon, clicks.walmart, clicks.flipkart, clicks.snapdeal, 1);

  // Animate numbers and set heights for the bars
  const platforms = [
    { id: 'amazon', name: 'Amazon', color: '#e47911', bgGlow: 'rgba(228, 121, 17, 0.15)' },
    { id: 'walmart', name: 'Walmart', color: '#0071dc', bgGlow: 'rgba(0, 113, 220, 0.15)' },
    { id: 'flipkart', name: 'Flipkart', color: '#1c5ec8', bgGlow: 'rgba(28, 94, 200, 0.15)' },
    { id: 'snapdeal', name: 'Snapdeal', color: '#e40046', bgGlow: 'rgba(228, 0, 70, 0.15)' },
  ];

  platforms.forEach(p => {
    const val = clicks[p.id];
    const percentage = total > 0 ? (val / total) * 100 : 0;
    const heightPercent = (val / max) * 100;

    // Set bar height
    const barEl = document.getElementById(`bar-${p.id}`);
    if (barEl) {
      // Small timeout for smooth animation
      setTimeout(() => {
        barEl.style.height = `${Math.max(heightPercent, 5)}%`;
      }, 50);
    }

    // Set tooltip text
    const colEl = document.querySelector(`.chart-bar-column[data-platform="${p.id}"]`);
    if (colEl) {
      const tooltipCount = colEl.querySelector('.chart-bar-tooltip .count');
      if (tooltipCount) {
        tooltipCount.textContent = val;
      }
    }
  });

  // Calculate Dominance Index details
  const sorted = [...platforms].sort((a, b) => clicks[b.id] - clicks[a.id]);
  const topPlat = sorted[0];

  const topNameEl = document.getElementById('top-platform-name');
  const topPercentageEl = document.getElementById('top-platform-percentage');
  const totalRedirectsEl = document.getElementById('stats-total-redirects');
  const avgRedirectsEl = document.getElementById('stats-avg-redirects');
  const leaderBg = document.getElementById('leader-icon-bg');

  if (totalRedirectsEl) totalRedirectsEl.textContent = total;
  if (avgRedirectsEl) avgRedirectsEl.textContent = (total / 4).toFixed(1);

  if (total > 0) {
    if (topNameEl) {
      topNameEl.textContent = topPlat.name;
      topNameEl.style.color = topPlat.color;
    }
    if (topPercentageEl) {
      topPercentageEl.textContent = `${((clicks[topPlat.id] / total) * 100).toFixed(0)}% of total navigation`;
    }
    if (leaderBg) {
      leaderBg.style.background = topPlat.bgGlow;
      leaderBg.style.color = topPlat.color;
    }
  } else {
    if (topNameEl) {
      topNameEl.textContent = 'None';
      topNameEl.style.color = '';
    }
    if (topPercentageEl) topPercentageEl.textContent = '0% of total navigation';
    if (leaderBg) {
      leaderBg.style.background = '';
      leaderBg.style.color = '';
    }
  }
}

function initRedirectionDashboard() {
  seedRedirectionStats();
  
  // Set up simulator button click handlers
  const simButtons = document.querySelectorAll('#profile-view .sim-btn');
  simButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const platform = btn.getAttribute('data-platform');
      trackRedirection(platform);

      // Auto-navigate to home/search view tab
      const homeTab = document.querySelector('.magnetic-tab[data-target="search-view"]');
      if (homeTab) {
        homeTab.click();
      }

      // Smooth scroll and focus the search input field
      const searchInput = document.getElementById('search-input');
      if (searchInput) {
        setTimeout(() => {
          searchInput.focus();
          searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 150);
      }
    });
  });

  // Set up reset button click handler
  const resetBtn = document.getElementById('reset-redirection-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      resetBtn.disabled = true;
      resetBtn.innerHTML = `
        <svg class="btn-icon animate-spin" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="animation: spin 1s linear infinite;"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
        Resetting...
      `;
      
      setTimeout(() => {
        localStorage.setItem('multimarket_clicks_amazon', '0');
        localStorage.setItem('multimarket_clicks_walmart', '0');
        localStorage.setItem('multimarket_clicks_flipkart', '0');
        localStorage.setItem('multimarket_clicks_snapdeal', '0');
        renderRedirectionGraph();
        
        resetBtn.disabled = false;
        resetBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="btn-icon"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>
          Reset Stats
        `;
      }, 600);
    });
  }

  // Render initially on app load
  renderRedirectionGraph();
}

// ==========================================
// WEBGL INTERACTIVE PIXELBLAST CANVAS PARITY
// ==========================================

const VERTEX_SRC = `
void main() {
  gl_Position = vec4(position, 1.0);
}
`;

const FRAGMENT_SRC = `
precision highp float;

uniform vec3  uColor;
uniform vec2  uResolution;
uniform float uTime;
uniform float uPixelSize;
uniform float uScale;
uniform float uDensity;
uniform float uPixelJitter;
uniform int   uEnableRipples;
uniform float uRippleSpeed;
uniform float uRippleThickness;
uniform float uRippleIntensity;
uniform float uEdgeFade;

uniform int   uShapeType;
const int SHAPE_SQUARE   = 0;
const int SHAPE_CIRCLE   = 1;
const int SHAPE_TRIANGLE = 2;
const int SHAPE_DIAMOND  = 3;

const int   MAX_CLICKS = 10;

uniform vec2  uClickPos  [MAX_CLICKS];
uniform float uClickTimes[MAX_CLICKS];

out vec4 fragColor;

float Bayer2(vec2 a) {
  a = floor(a);
  return fract(a.x / 2. + a.y * a.y * .75);
}
#define Bayer4(a) (Bayer2(.5*(a))*0.25 + Bayer2(a))
#define Bayer8(a) (Bayer4(.5*(a))*0.25 + Bayer2(a))

#define FBM_OCTAVES     5
#define FBM_LACUNARITY  1.25
#define FBM_GAIN        1.0

float hash11(float n){ return fract(sin(n)*43758.5453); }

float vnoise(vec3 p){
  vec3 ip = floor(p);
  vec3 fp = fract(p);
  float n000 = hash11(dot(ip + vec3(0.0,0.0,0.0), vec3(1.0,57.0,113.0)));
  float n100 = hash11(dot(ip + vec3(1.0,0.0,0.0), vec3(1.0,57.0,113.0)));
  float n010 = hash11(dot(ip + vec3(0.0,1.0,0.0), vec3(1.0,57.0,113.0)));
  float n110 = hash11(dot(ip + vec3(1.0,1.0,0.0), vec3(1.0,57.0,113.0)));
  float n001 = hash11(dot(ip + vec3(0.0,0.0,1.0), vec3(1.0,57.0,113.0)));
  float n101 = hash11(dot(ip + vec3(1.0,0.0,1.0), vec3(1.0,57.0,113.0)));
  float n011 = hash11(dot(ip + vec3(0.0,1.0,1.0), vec3(1.0,57.0,113.0)));
  float n111 = hash11(dot(ip + vec3(1.0,1.0,1.0), vec3(1.0,57.0,113.0)));
  vec3 w = fp*fp*fp*(fp*(fp*6.0-15.0)+10.0);
  float x00 = mix(n000, n100, w.x);
  float x10 = mix(n010, n110, w.x);
  float x01 = mix(n001, n101, w.x);
  float x11 = mix(n011, n111, w.x);
  float y0  = mix(x00, x10, w.y);
  float y1  = mix(x01, x11, w.y);
  return mix(y0, y1, w.z) * 2.0 - 1.0;
}

float fbm2(vec2 uv, float t){
  vec3 p = vec3(uv * uScale, t);
  float amp = 1.0;
  float freq = 1.0;
  float sum = 1.0;
  for (int i = 0; i < FBM_OCTAVES; ++i){
    sum  += amp * vnoise(p * freq);
    freq *= FBM_LACUNARITY;
    amp  *= FBM_GAIN;
  }
  return sum * 0.5 + 0.5;
}

float maskCircle(vec2 p, float cov){
  float r = sqrt(cov) * .25;
  float d = length(p - 0.5) - r;
  float aa = 0.5 * fwidth(d);
  return cov * (1.0 - smoothstep(-aa, aa, d * 2.0));
}

float maskTriangle(vec2 p, vec2 id, float cov){
  bool flip = mod(id.x + id.y, 2.0) > 0.5;
  if (flip) p.x = 1.0 - p.x;
  float r = sqrt(cov);
  float d  = p.y - r*(1.0 - p.x);
  float aa = fwidth(d);
  return cov * clamp(0.5 - d/aa, 0.0, 1.0);
}

float maskDiamond(vec2 p, float cov){
  float r = sqrt(cov) * 0.564;
  return step(abs(p.x - 0.49) + abs(p.y - 0.49), r);
}

void main(){
  float pixelSize = uPixelSize;
  vec2 fragCoord = gl_FragCoord.xy - uResolution * .5;
  float aspectRatio = uResolution.x / uResolution.y;

  vec2 pixelId = floor(fragCoord / pixelSize);
  vec2 pixelUV = fract(fragCoord / pixelSize);

  float cellPixelSize = 8.0 * pixelSize;
  vec2 cellId = floor(fragCoord / cellPixelSize);
  vec2 cellCoord = cellId * cellPixelSize;
  vec2 uv = cellCoord / uResolution * vec2(aspectRatio, 1.0);

  float base = fbm2(uv, uTime * 0.05);
  base = base * 0.5 - 0.65;

  float feed = base + (uDensity - 0.5) * 0.3;

  float speed     = uRippleSpeed;
  float thickness = uRippleThickness;
  const float dampT     = 1.0;
  const float dampR     = 10.0;

  if (uEnableRipples == 1) {
    for (int i = 0; i < MAX_CLICKS; ++i){
      vec2 pos = uClickPos[i];
      if (pos.x < 0.0) continue;
      float cellPixelSize = 8.0 * pixelSize;
      vec2 cuv = (((pos - uResolution * .5 - cellPixelSize * .5) / (uResolution))) * vec2(aspectRatio, 1.0);
      float t = max(uTime - uClickTimes[i], 0.0);
      float r = distance(uv, cuv);
      float waveR = speed * t;
      float ring  = exp(-pow((r - waveR) / thickness, 2.0));
      float atten = exp(-dampT * t) * exp(-dampR * r);
      feed = max(feed, ring * atten * uRippleIntensity);
    }
  }

  float bayer = Bayer8(fragCoord / uPixelSize) - 0.5;
  float bw = step(0.5, feed + bayer);

  float h = fract(sin(dot(floor(fragCoord / uPixelSize), vec2(127.1, 311.7))) * 43758.5453);
  float jitterScale = 1.0 + (h - 0.5) * uPixelJitter;
  float coverage = bw * jitterScale;
  float M;
  if      (uShapeType == SHAPE_CIRCLE)   M = maskCircle (pixelUV, coverage);
  else if (uShapeType == SHAPE_TRIANGLE) M = maskTriangle(pixelUV, pixelId, coverage);
  else if (uShapeType == SHAPE_DIAMOND)  M = maskDiamond(pixelUV, coverage);
  else                                   M = coverage;

  if (uEdgeFade > 0.0) {
    vec2 norm = gl_FragCoord.xy / uResolution;
    float edge = min(min(norm.x, norm.y), min(1.0 - norm.x, 1.0 - norm.y));
    float fade = smoothstep(0.0, uEdgeFade, edge);
    M *= fade;
  }

  vec3 color = uColor;

  vec3 srgbColor = mix(
    color * 12.92,
    1.055 * pow(color, vec3(1.0 / 2.4)) - 0.055,
    step(0.0031308, color)
  );

  fragColor = vec4(srgbColor, M);
}
`;

function createTouchTexture() {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D context not available');
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const texture = new THREE.Texture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  const trail = [];
  let last = null;
  const maxAge = 64;
  let radius = 0.1 * size;
  const speed = 1 / maxAge;
  
  const clear = () => {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };
  
  const drawPoint = (p) => {
    const pos = { x: p.x * size, y: (1 - p.y) * size };
    let intensity = 1;
    const easeOutSine = (t) => Math.sin((t * Math.PI) / 2);
    const easeOutQuad = (t) => -t * (t - 2);
    if (p.age < maxAge * 0.3) intensity = easeOutSine(p.age / (maxAge * 0.3));
    else intensity = easeOutQuad(1 - (p.age - maxAge * 0.3) / (maxAge * 0.7)) || 0;
    intensity *= p.force;
    const color = `${((p.vx + 1) / 2) * 255}, ${((p.vy + 1) / 2) * 255}, ${intensity * 255}`;
    const offset = size * 5;
    ctx.shadowOffsetX = offset;
    ctx.shadowOffsetY = offset;
    ctx.shadowBlur = radius;
    ctx.shadowColor = `rgba(${color},${0.22 * intensity})`;
    ctx.beginPath();
    ctx.fillStyle = 'rgba(255,0,0,1)';
    ctx.arc(pos.x - offset, pos.y - offset, radius, 0, Math.PI * 2);
    ctx.fill();
  };
  
  const addTouch = (norm) => {
    let force = 0;
    let vx = 0;
    let vy = 0;
    if (last) {
      const dx = norm.x - last.x;
      const dy = norm.y - last.y;
      if (dx === 0 && dy === 0) return;
      const dd = dx * dx + dy * dy;
      const d = Math.sqrt(dd);
      vx = dx / (d || 1);
      vy = dy / (d || 1);
      force = Math.min(dd * 10000, 1);
    }
    last = { x: norm.x, y: norm.y };
    trail.push({ x: norm.x, y: norm.y, age: 0, force, vx, vy });
  };
  
  const update = () => {
    clear();
    for (let i = trail.length - 1; i >= 0; i--) {
      const point = trail[i];
      const f = point.force * speed * (1 - point.age / maxAge);
      point.x += point.vx * f;
      point.y += point.vy * f;
      point.age++;
      if (point.age > maxAge) trail.splice(i, 1);
    }
    for (let i = 0; i < trail.length; i++) drawPoint(trail[i]);
    texture.needsUpdate = true;
  };
  
  return {
    canvas,
    texture,
    addTouch,
    update,
    setRadiusScale(v) {
      radius = 0.1 * size * v;
    },
    size
  };
}

function createLiquidEffect(texture, opts) {
  const fragment = `
    uniform sampler2D uTexture;
    uniform float uStrength;
    uniform float uTime;
    uniform float uFreq;

    void mainUv(inout vec2 uv) {
      vec4 tex = texture2D(uTexture, uv);
      float vx = tex.r * 2.0 - 1.0;
      float vy = tex.g * 2.0 - 1.0;
      float intensity = tex.b;

      float wave = 0.5 + 0.5 * sin(uTime * uFreq + intensity * 6.2831853);

      float amt = uStrength * intensity * wave;

      uv += vec2(vx, vy) * amt;
    }
  `;
  return new Effect('LiquidEffect', fragment, {
    uniforms: new Map([
      ['uTexture', new THREE.Uniform(texture)],
      ['uStrength', new THREE.Uniform(opts?.strength ?? 0.025)],
      ['uTime', new THREE.Uniform(0)],
      ['uFreq', new THREE.Uniform(opts?.freq ?? 4.5)]
    ])
  });
}

function initPixelBlast() {
  const container = document.getElementById('pixel-blast-canvas-container');
  if (!container) return;

  const canvas = document.createElement('canvas');
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  container.appendChild(canvas);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearAlpha(0);

  const maxClicks = 10;
  const uniforms = {
    uResolution: { value: new THREE.Vector2(0, 0) },
    uTime: { value: 0 },
    uColor: { value: new THREE.Color('#B497CF') },
    uClickPos: {
      value: Array.from({ length: maxClicks }, () => new THREE.Vector2(-1, -1))
    },
    uClickTimes: { value: new Float32Array(maxClicks) },
    uShapeType: { value: 1 }, // circle
    uPixelSize: { value: 6 * renderer.getPixelRatio() },
    uScale: { value: 3.0 },
    uDensity: { value: 1.2 },
    uPixelJitter: { value: 0.5 },
    uEnableRipples: { value: 1 },
    uRippleSpeed: { value: 0.4 },
    uRippleThickness: { value: 0.12 },
    uRippleIntensity: { value: 1.5 },
    uEdgeFade: { value: 0.25 }
  };

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const material = new THREE.ShaderMaterial({
    vertexShader: VERTEX_SRC,
    fragmentShader: FRAGMENT_SRC,
    uniforms,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    glslVersion: THREE.GLSL3
  });

  const quadGeom = new THREE.PlaneGeometry(2, 2);
  const quad = new THREE.Mesh(quadGeom, material);
  scene.add(quad);

  const clock = new THREE.Clock();

  const setSize = () => {
    const w = container.clientWidth || 1;
    const h = container.clientHeight || 1;
    renderer.setSize(w, h, false);
    uniforms.uResolution.value.set(renderer.domElement.width, renderer.domElement.height);
    if (composer) {
      composer.setSize(renderer.domElement.width, renderer.domElement.height);
    }
    uniforms.uPixelSize.value = 6 * renderer.getPixelRatio();
  };

  const timeOffset = Math.random() * 1000;
  
  const touch = createTouchTexture();
  touch.setRadiusScale(1.2);

  const composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);
  const liquidEffect = createLiquidEffect(touch.texture, {
    strength: 0.12,
    freq: 5.0
  });
  const effectPass = new EffectPass(camera, liquidEffect);
  effectPass.renderToScreen = true;
  composer.addPass(renderPass);
  composer.addPass(effectPass);

  setSize();

  const ro = new ResizeObserver(setSize);
  ro.observe(container);

  const mapToPixels = (e) => {
    const rect = renderer.domElement.getBoundingClientRect();
    const scaleX = renderer.domElement.width / rect.width;
    const scaleY = renderer.domElement.height / rect.height;
    const fx = (e.clientX - rect.left) * scaleX;
    const fy = (rect.height - (e.clientY - rect.top)) * scaleY;
    return {
      fx,
      fy,
      w: renderer.domElement.width,
      h: renderer.domElement.height
    };
  };

  let clickIx = 0;
  const onPointerDown = (e) => {
    const { fx, fy } = mapToPixels(e);
    const clickPositions = uniforms.uClickPos.value;
    clickPositions[clickIx].set(fx, fy);
    const clickTimes = uniforms.uClickTimes.value;
    clickTimes[clickIx] = uniforms.uTime.value;
    clickIx = (clickIx + 1) % maxClicks;
  };

  const onPointerMove = (e) => {
    const { fx, fy, w, h } = mapToPixels(e);
    touch.addTouch({ x: fx / w, y: fy / h });
  };

  renderer.domElement.addEventListener('pointerdown', onPointerDown, { passive: true });
  renderer.domElement.addEventListener('pointermove', onPointerMove, { passive: true });

  const animate = () => {
    const rect = container.getBoundingClientRect();
    const visible = rect.bottom >= 0 && rect.top <= window.innerHeight;
    
    if (visible) {
      uniforms.uTime.value = timeOffset + clock.getElapsedTime() * 0.6;
      const uTimeUniform = liquidEffect.uniforms.get('uTime');
      if (uTimeUniform) uTimeUniform.value = uniforms.uTime.value;

      touch.update();
      composer.render();
    }
    requestAnimationFrame(animate);
  };
  requestAnimationFrame(animate);
}



function initMagicBento() {
  const cards = document.querySelectorAll('.magic-bento-card');
  
  cards.forEach(card => {
    const customGlow = card.getAttribute('data-glow') || '132, 0, 255';
    let starInterval = null;

    // Star spawner
    function spawnStar() {
      if (window.innerWidth < 768) return;
      const star = document.createElement('div');
      star.className = 'magic-bento-star';
      
      const x = Math.random() * 80 + 10;
      const y = Math.random() * 30 + 60;
      star.style.left = `${x}%`;
      star.style.top = `${y}%`;
      
      star.style.background = `rgba(${customGlow}, 0.8)`;
      star.style.boxShadow = `0 0 10px rgba(${customGlow}, 0.9)`;
      
      card.appendChild(star);

      gsap.fromTo(
        star,
        { y: 0, scale: 0, opacity: 0, rotation: 0 },
        {
          y: -120 - Math.random() * 80,
          scale: Math.random() * 1.5 + 0.5,
          opacity: 0.8,
          rotation: Math.random() * 360,
          duration: 1.5 + Math.random() * 1.5,
          ease: 'power1.out',
          onComplete: () => {
            gsap.to(star, {
              opacity: 0,
              duration: 0.4,
              onComplete: () => star.remove(),
            });
          },
        }
      );
    }

    card.addEventListener('mouseenter', () => {
      card.style.setProperty('--glow-intensity', '1');
      
      if (window.innerWidth >= 768) {
        if (starInterval) clearInterval(starInterval);
        starInterval = setInterval(spawnStar, 200);
      }
    });

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      card.style.setProperty('--glow-x', `${x}px`);
      card.style.setProperty('--glow-y', `${y}px`);
      card.style.setProperty('--spotlight-radius', '300px');
      card.style.setProperty('--glow-color', customGlow);

      if (window.innerWidth >= 768) {
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateY = ((x - centerX) / centerX) * 8;
        const rotateX = -((y - centerY) / centerY) * 8;

        gsap.to(card, {
          rotationX: rotateX,
          rotationY: rotateY,
          transformPerspective: 800,
          duration: 0.2,
          ease: 'power1.out',
        });

        const inner = card.querySelector('.bento-card-inner');
        if (inner) {
          const magnetX = ((x - centerX) / centerX) * 12;
          const magnetY = ((y - centerY) / centerY) * 12;
          gsap.to(inner, {
            x: magnetX,
            y: magnetY,
            duration: 0.2,
            ease: 'power1.out',
          });
        }
      }
    });

    card.addEventListener('mouseleave', () => {
      card.style.setProperty('--glow-intensity', '0');
      
      if (starInterval) {
        clearInterval(starInterval);
        starInterval = null;
      }

      if (window.innerWidth >= 768) {
        gsap.to(card, {
          x: 0,
          y: 0,
          rotationX: 0,
          rotationY: 0,
          duration: 0.5,
          ease: 'power2.out',
        });

        const inner = card.querySelector('.bento-card-inner');
        if (inner) {
          gsap.to(inner, {
            x: 0,
            y: 0,
            duration: 0.5,
            ease: 'power2.out',
          });
        }
      }
    });

    card.addEventListener('click', (e) => {
      if (window.innerWidth < 768) return;

      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const ripple = document.createElement('div');
      ripple.className = 'magic-bento-ripple';
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      ripple.style.background = `radial-gradient(circle, rgba(${customGlow}, 0.4) 0%, rgba(${customGlow}, 0) 70%)`;
      
      card.appendChild(ripple);

      gsap.fromTo(
        ripple,
        { scale: 0, opacity: 1 },
        {
          scale: 4,
          opacity: 0,
          duration: 0.8,
          ease: 'power2.out',
          onComplete: () => ripple.remove(),
        }
      );
    });
  });
}


