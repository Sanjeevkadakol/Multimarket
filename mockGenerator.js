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
  const audioKeywords = [
    'headphone', 'earphone', 'audio', 'speaker', 'buds', 'airpods', 'soundbar', 'headset', 'earbuds', 
    'noise-cancelling', 'anc', 'jbl', 'bose', 'boat', 'noise'
  ];
  const shoeKeywords = [
    'shoe', 'sneaker', 'nike', 'adidas', 'puma', 'reebok', 'bata', 'crocs', 'woodland', 'running', 
    'footwear', 'slipper'
  ];

  if (phoneKeywords.some(keyword => qLower.includes(keyword))) {
    activeImages = categories.phone;
  } else if (laptopKeywords.some(keyword => qLower.includes(keyword))) {
    activeImages = categories.laptop;
  } else if (audioKeywords.some(keyword => qLower.includes(keyword))) {
    activeImages = categories.audio;
  } else if (shoeKeywords.some(keyword => qLower.includes(keyword))) {
    activeImages = categories.shoe;
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

  if (platform === 'amazon') {
    return [
      {
        title: `${query} Pro (Amazon Special Edition)`,
        price: '₹54,999',
        image: getUniqueImage(0),
        rating: '4.6',
        url: `https://www.amazon.in/s?k=${encodeURIComponent(searchQuery)}&mock_id=0`
      },
      {
        title: `${query} Premium Plus (Renewed)`,
        price: '₹39,990',
        image: getUniqueImage(1),
        rating: '4.2',
        url: `https://www.amazon.in/s?k=${encodeURIComponent(searchQuery)}&mock_id=1`
      },
      {
        title: `${query} Lite Edition 5G`,
        price: '₹22,499',
        image: getUniqueImage(2),
        rating: '4.0',
        url: `https://www.amazon.in/s?k=${encodeURIComponent(searchQuery)}&mock_id=2`
      }
    ];
  } else if (platform === 'walmart') {
    return [
      {
        title: `${query} Max (Walmart Exclusive)`,
        price: '₹53,999',
        image: getUniqueImage(0),
        rating: '4.8',
        url: `https://www.walmart.com/search?q=${encodeURIComponent(searchQuery)}&mock_id=0`
      },
      {
        title: `${query} - Great Value Pack`,
        price: '₹66,300',
        image: getUniqueImage(1),
        rating: '4.9',
        url: `https://www.walmart.com/search?q=${encodeURIComponent(searchQuery)}&mock_id=1`
      },
      {
        title: `${query} Standard (Rollback Special)`,
        price: '₹9,990',
        image: getUniqueImage(2),
        rating: '3.5',
        url: `https://www.walmart.com/search?q=${encodeURIComponent(searchQuery)}&mock_id=2`
      }
    ];
  } else if (platform === 'flipkart') {
    return [
      {
        title: `${query} Super (Flipkart Assured)`,
        price: '₹58,200',
        image: getUniqueImage(0),
        rating: '4.7',
        url: `https://www.flipkart.com/search?q=${encodeURIComponent(searchQuery)}&mock_id=0`
      },
      {
        title: `${query} Value Bundle Edition`,
        price: '₹24,999',
        image: getUniqueImage(1),
        rating: '4.4',
        url: `https://www.flipkart.com/search?q=${encodeURIComponent(searchQuery)}&mock_id=1`
      },
      {
        title: `${query} Smart Choice`,
        price: '₹14,990',
        image: getUniqueImage(2),
        rating: '4.1',
        url: `https://www.flipkart.com/search?q=${encodeURIComponent(searchQuery)}&mock_id=2`
      }
    ];
  } else if (platform === 'snapdeal') {
    return [
      {
        title: `${query} Premium (Snapdeal Deal of the Day)`,
        price: '₹51,999',
        image: getUniqueImage(0),
        rating: '4.5',
        url: `https://www.snapdeal.com/search?keyword=${encodeURIComponent(searchQuery)}&mock_id=0`
      },
      {
        title: `${query} Sleek Standard`,
        price: '₹21,800',
        image: getUniqueImage(1),
        rating: '4.1',
        url: `https://www.snapdeal.com/search?keyword=${encodeURIComponent(searchQuery)}&mock_id=1`
      },
      {
        title: `${query} Eco Plus Pack`,
        price: '₹12,490',
        image: getUniqueImage(2),
        rating: '3.8',
        url: `https://www.snapdeal.com/search?keyword=${encodeURIComponent(searchQuery)}&mock_id=2`
      }
    ];
  }
  return [];
}
