import { generateMockProducts } from './mockGenerator.js';

// Parse comma-separated keys from environment variable
const apiKeys = (process.env.RAPIDAPI_KEY || "")
  .split(",")
  .map(k => k.trim())
  .filter(k => k && k !== "your_rapidapi_key_goes_here");

// Keep track of which keys are currently rate-limited or invalid
const blockedKeys = new Set();

/**
 * Perform a fetch to RapidAPI with automatic fallback to secondary keys on 429 or other errors.
 * @param {string} url - The endpoint URL
 * @param {string} host - The RapidAPI host
 * @returns {Promise<any>} - The response JSON data, or null if all keys failed
 */
export async function fetchWithRotation(url, host) {
  if (apiKeys.length === 0) {
    console.warn(`[RapidAPI Client] ⚠️ No valid keys configured in RAPIDAPI_KEY env variable.`);
    return null;
  }

  // Filter keys that aren't blocked
  let activeKeys = apiKeys.filter(k => !blockedKeys.has(k));
  if (activeKeys.length === 0) {
    console.warn(`[RapidAPI Client] ⚠️ All configured keys were previously rate-limited. Resetting block statuses and retrying...`);
    blockedKeys.clear();
    activeKeys = apiKeys;
  }

  for (const apiKey of activeKeys) {
    const options = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': host
      }
    };

    const maskedKey = apiKey.length > 8 ? `...${apiKey.slice(-6)}` : '***';

    try {
      console.log(`[RapidAPI Client] Querying live endpoint using key ${maskedKey}`);
      const response = await fetch(url, options);

      if (response.status === 200) {
        const data = await response.json();
        return data;
      } else if (response.status === 429) {
        const responseText = await response.text().catch(() => '');
        console.warn(`[RapidAPI Client] Key ${maskedKey} returned status 429 (Rate Limit Exceeded). Response: ${responseText}`);
        blockedKeys.add(apiKey);
      } else {
        const responseText = await response.text().catch(() => '');
        console.warn(`[RapidAPI Client] Key ${maskedKey} returned status ${response.status}. Response: ${responseText}`);
        blockedKeys.add(apiKey); // Block for other errors (e.g. invalid/unauthorized)
      }
    } catch (error) {
      console.error(`[RapidAPI Client] Error with key ${maskedKey}:`, error);
    }
  }

  console.error(`[RapidAPI Client] ❌ All ${apiKeys.length} configured RapidAPI keys failed.`);
  return null;
}
