export function generateMockProducts(searchQuery, platform) {
  const query = searchQuery.trim().charAt(0).toUpperCase() + searchQuery.trim().slice(1);
  const qLower = query.toLowerCase();
  
  // Curated premium images for popular tech & fashion search terms
  const categories = {
    phone: [
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&fit=crop', // Elegant pink modern phone
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&fit=crop', // Sleek phone lying on clean background
      'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=400&fit=crop'  // Hand holding premium smartphone
    ],
    laptop: [
      'https://images.unsplash.com/photo-1496181130204-755241544e35?w=400&fit=crop', // Classic aesthetic laptop workstation
      'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400&fit=crop', // Futuristic tech notebook computer
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&fit=crop'  // Laptop on wooden desk with coffee
    ],
    earbuds: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&fit=crop', // Sleek black wireless earbuds, yellow background
      'https://images.unsplash.com/photo-1608156639585-b3a032ef9689?w=400&fit=crop', // White wireless charging case and buds
      'https://images.unsplash.com/photo-1588449668365-d15e397f6787?w=400&fit=crop'  // Minimalist black buds on dark background
    ],
    audio: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&fit=crop', // Premium headphones over golden warm light
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&fit=crop', // Minimalist headphones on sleek dark stand
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&fit=crop'  // Studio monitor headphones on wooden table
    ],
    shoe: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&fit=crop', // Dynamic red athletic runner shoe
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&fit=crop', // Modern clean neon-green sneakers
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&fit=crop'  // Multi-colored designer sneaker floating
    ],
    default: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&fit=crop', // Luxury minimalist white watch
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&fit=crop', // Modern rugged style smartwatch
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=400&fit=crop'  // Premium classic leather watch
    ]
  };

  // Determine active category based on query keywords
  let activeImages = categories.default;
  let activeCategory = 'default';
  
  // High-fidelity keyword lists for robust classification
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
  const earbudsKeywords = [
    'earbud', 'earbuds', 'buds', 'airpod', 'airpods', 'tws', 'in-ear', 'earphone', 'earphones', 'ear buds', 'ear bid', 'ear bids'
  ];
  const audioKeywords = [
    'headphone', 'audio', 'speaker', 'soundbar', 'headset', 
    'noise-cancelling', 'anc', 'jbl', 'bose', 'boat', 'noise'
  ];
  const shoeKeywords = [
    'shoe', 'sneaker', 'nike', 'adidas', 'puma', 'reebok', 'bata', 'crocs', 'woodland', 'running', 
    'footwear', 'slipper'
  ];

  const isEarbuds = earbudsKeywords.some(keyword => qLower.includes(keyword)) ||
                    /ear[\s-]*buds?/i.test(qLower) ||
                    /air[\s-]*pods?/i.test(qLower) ||
                    /ear[\s-]*phones?/i.test(qLower) ||
                    /aer[\s-]*buds?/i.test(qLower) ||
                    /aer[\s-]*phones?/i.test(qLower);
  const isAudio = audioKeywords.some(keyword => qLower.includes(keyword)) ||
                  /h[aeo]*d[\s-]*[pf]h?o*n/i.test(qLower) ||
                  /h[aeo]*d[\s-]*set/i.test(qLower) ||
                  /ear[\s-]*phone/i.test(qLower);

  if (isEarbuds) {
    activeImages = categories.earbuds;
    activeCategory = 'earbuds';
  } else if (isAudio) {
    activeImages = categories.audio;
    activeCategory = 'audio';
  } else if (phoneKeywords.some(keyword => qLower.includes(keyword))) {
    activeImages = categories.phone;
    activeCategory = 'phone';
  } else if (laptopKeywords.some(keyword => qLower.includes(keyword))) {
    activeImages = categories.laptop;
    activeCategory = 'laptop';
  } else if (shoeKeywords.some(keyword => qLower.includes(keyword))) {
    activeImages = categories.shoe;
    activeCategory = 'shoe';
  }

  // Get unique image for each platform & position to prevent repetition across columns
  function getUniqueImage(index) {
    let offset = 0;
    if (platform === 'walmart') offset = 1;
    if (platform === 'flipkart') offset = 2;
    if (platform === 'snapdeal') offset = 3;
    const idx = (index + offset) % activeImages.length;
    return activeImages[idx];
  }

  // Retrieve platform and category specific price
  function getPrice(index) {
    const prices = {
      phone: {
        amazon: ['₹49,999', '₹29,999', '₹14,999'],
        walmart: ['₹48,990', '₹31,500', '₹15,200'],
        flipkart: ['₹50,499', '₹28,999', '₹14,499'],
        snapdeal: ['₹47,999', '₹27,800', '₹13,999']
      },
      laptop: {
        amazon: ['₹74,999', '₹54,999', '₹34,999'],
        walmart: ['₹73,500', '₹56,200', '₹35,800'],
        flipkart: ['₹76,499', '₹53,999', '₹33,999'],
        snapdeal: ['₹71,999', '₹51,800', '₹32,999']
      },
      earbuds: {
        amazon: ['₹4,999', '₹2,999', '₹1,499'],
        walmart: ['₹4,850', '₹3,100', '₹1,550'],
        flipkart: ['₹5,199', '₹2,899', '₹1,399'],
        snapdeal: ['₹4,699', '₹2,750', '₹1,299']
      },
      audio: {
        amazon: ['₹11,999', '₹6,499', '₹2,999'],
        walmart: ['₹11,500', '₹6,750', '₹3,150'],
        flipkart: ['₹12,499', '₹6,200', '₹2,850'],
        snapdeal: ['₹10,999', '₹5,990', '₹2,699']
      },
      shoe: {
        amazon: ['₹5,999', '₹3,499', '₹1,299'],
        walmart: ['₹5,800', '₹3,650', '₹1,350'],
        flipkart: ['₹6,199', '₹3,299', '₹1,199'],
        snapdeal: ['₹5,499', '₹2,999', '₹1,099']
      },
      default: {
        amazon: ['₹3,499', '₹1,999', '₹999'],
        walmart: ['₹3,350', '₹2,100', '₹1,050'],
        flipkart: ['₹3,599', '₹1,899', '₹949'],
        snapdeal: ['₹3,199', '₹1,750', '₹899']
      }
    };

    const categoryData = prices[activeCategory] || prices.default;
    const platformData = categoryData[platform] || categoryData.amazon;
    return platformData[index] || 'N/A';
  }

  if (platform === 'amazon') {
    return [
      {
        title: `${query} Pro (Amazon Special Edition)`,
        price: getPrice(0),
        image: getUniqueImage(0),
        rating: '4.6',
        url: `https://www.amazon.in/s?k=${encodeURIComponent(searchQuery)}&mock_id=0`
      },
      {
        title: `${query} Premium Plus (Renewed)`,
        price: getPrice(1),
        image: getUniqueImage(1),
        rating: '4.2',
        url: `https://www.amazon.in/s?k=${encodeURIComponent(searchQuery)}&mock_id=1`
      },
      {
        title: `${query} Lite Edition 5G`,
        price: getPrice(2),
        image: getUniqueImage(2),
        rating: '4.0',
        url: `https://www.amazon.in/s?k=${encodeURIComponent(searchQuery)}&mock_id=2`
      }
    ];
  } else if (platform === 'walmart') {
    return [
      {
        title: `${query} Max (Walmart Exclusive)`,
        price: getPrice(0),
        image: getUniqueImage(0),
        rating: '4.8',
        url: `https://www.walmart.com/search?q=${encodeURIComponent(searchQuery)}&mock_id=0`
      },
      {
        title: `${query} - Great Value Pack`,
        price: getPrice(1),
        image: getUniqueImage(1),
        rating: '4.9',
        url: `https://www.walmart.com/search?q=${encodeURIComponent(searchQuery)}&mock_id=1`
      },
      {
        title: `${query} Standard (Rollback Special)`,
        price: getPrice(2),
        image: getUniqueImage(2),
        rating: '3.5',
        url: `https://www.walmart.com/search?q=${encodeURIComponent(searchQuery)}&mock_id=2`
      }
    ];
  } else if (platform === 'flipkart') {
    return [
      {
        title: `${query} Super (Flipkart Assured)`,
        price: getPrice(0),
        image: getUniqueImage(0),
        rating: '4.7',
        url: `https://www.flipkart.com/search?q=${encodeURIComponent(searchQuery)}&mock_id=0`
      },
      {
        title: `${query} Value Bundle Edition`,
        price: getPrice(1),
        image: getUniqueImage(1),
        rating: '4.4',
        url: `https://www.flipkart.com/search?q=${encodeURIComponent(searchQuery)}&mock_id=1`
      },
      {
        title: `${query} Smart Choice`,
        price: getPrice(2),
        image: getUniqueImage(2),
        rating: '4.1',
        url: `https://www.flipkart.com/search?q=${encodeURIComponent(searchQuery)}&mock_id=2`
      }
    ];
  } else if (platform === 'snapdeal') {
    return [
      {
        title: `${query} Premium (Snapdeal Deal of the Day)`,
        price: getPrice(0),
        image: getUniqueImage(0),
        rating: '4.5',
        url: `https://www.snapdeal.com/search?keyword=${encodeURIComponent(searchQuery)}&mock_id=0`
      },
      {
        title: `${query} Sleek Standard`,
        price: getPrice(1),
        image: getUniqueImage(1),
        rating: '4.1',
        url: `https://www.snapdeal.com/search?keyword=${encodeURIComponent(searchQuery)}&mock_id=1`
      },
      {
        title: `${query} Eco Plus Pack`,
        price: getPrice(2),
        image: getUniqueImage(2),
        rating: '3.8',
        url: `https://www.snapdeal.com/search?keyword=${encodeURIComponent(searchQuery)}&mock_id=2`
      }
    ];
  }
  return [];
}
