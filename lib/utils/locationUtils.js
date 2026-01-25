/**
 * Location Normalization Utility
 * Consolidates similar location strings into canonical forms
 */

// Canonical location mappings - maps variants to standard names
const LOCATION_MAPPINGS = {
  // Major US Tech Hubs
  'San Francisco, CA': [
    'San Francisco', 'SF', 'San Francisco, California', 'SF Bay Area',
    'San Francisco Bay Area', 'Bay Area', 'S.F.', 'SanFrancisco'
  ],
  'New York, NY': [
    'New York', 'NYC', 'New York City', 'Manhattan', 'Brooklyn',
    'New York, New York', 'NY', 'N.Y.C.', 'NewYork'
  ],
  'Los Angeles, CA': [
    'Los Angeles', 'LA', 'Los Angeles, California', 'L.A.',
    'LosAngeles', 'Hollywood', 'Santa Monica'
  ],
  'Seattle, WA': [
    'Seattle', 'Seattle, Washington', 'Bellevue', 'Redmond'
  ],
  'Austin, TX': [
    'Austin', 'Austin, Texas', 'Austin TX'
  ],
  'Boston, MA': [
    'Boston', 'Boston, Massachusetts', 'Cambridge, MA', 'Cambridge'
  ],
  'Denver, CO': [
    'Denver', 'Denver, Colorado', 'Boulder', 'Boulder, CO'
  ],
  'Chicago, IL': [
    'Chicago', 'Chicago, Illinois'
  ],
  'Miami, FL': [
    'Miami', 'Miami, Florida', 'Miami Beach'
  ],
  'Washington, DC': [
    'Washington', 'Washington DC', 'D.C.', 'DC', 'Washington, D.C.'
  ],
  // International
  'London, UK': [
    'London', 'London, United Kingdom', 'London, England', 'UK'
  ],
  'Berlin, Germany': [
    'Berlin', 'Berlin, DE', 'Germany'
  ],
  'Toronto, Canada': [
    'Toronto', 'Toronto, ON', 'Canada'
  ],
  // Remote variants - all map to "Remote"
  'Remote': [
    'Remote', 'remote', 'Remote Work', 'Work from Home', 'WFH',
    'Anywhere', 'Fully Remote', 'Remote-first', 'Remote First',
    'Work From Anywhere', 'Distributed', 'Remote USA', 'Remote US',
    'Remote - US', 'Remote - USA', 'Remote (US)', 'Remote (USA)',
    '100% Remote', 'Worldwide'
  ]
};

// Build reverse lookup map for faster matching
const buildReverseLookup = () => {
  const lookup = new Map();
  for (const [canonical, variants] of Object.entries(LOCATION_MAPPINGS)) {
    for (const variant of variants) {
      lookup.set(variant.toLowerCase(), canonical);
    }
    // Also add the canonical name itself
    lookup.set(canonical.toLowerCase(), canonical);
  }
  return lookup;
};

const reverseLookup = buildReverseLookup();

/**
 * Normalize a location string to its canonical form
 * @param {string} location - Raw location string
 * @returns {string} - Normalized location string
 */
export function normalizeLocation(location) {
  if (!location || typeof location !== 'string') {
    return 'Not specified';
  }

  const trimmed = location.trim();
  const lowercased = trimmed.toLowerCase();

  // Direct lookup in reverse map
  if (reverseLookup.has(lowercased)) {
    return reverseLookup.get(lowercased);
  }

  // Check for remote indicators anywhere in string
  if (/remote|anywhere|wfh|work from home|distributed|worldwide/i.test(trimmed)) {
    return 'Remote';
  }

  // Check for partial matches (location contains a known variant)
  for (const [canonical, variants] of Object.entries(LOCATION_MAPPINGS)) {
    for (const variant of variants) {
      if (lowercased.includes(variant.toLowerCase())) {
        return canonical;
      }
    }
  }

  // Return original with title case if no match
  return trimmed;
}

/**
 * Check if a location is remote
 * @param {string} location - Location string
 * @returns {boolean}
 */
export function isRemote(location) {
  if (!location) return false;
  const normalized = normalizeLocation(location);
  return normalized === 'Remote';
}

/**
 * Get unique consolidated locations from an array of jobs/companies
 * @param {Array} items - Array of objects with Location property
 * @param {string} locationKey - Key to access location (default: 'Location')
 * @returns {Array<string>} - Sorted array of unique normalized locations
 */
export function getConsolidatedLocations(items, locationKey = 'Location') {
  const locations = new Set();
  
  for (const item of items) {
    const rawLocation = item[locationKey] || item.location || item.country;
    if (rawLocation) {
      const normalized = normalizeLocation(rawLocation);
      if (normalized !== 'Not specified') {
        locations.add(normalized);
      }
    }
  }
  
  // Sort with Remote first, then alphabetically
  return Array.from(locations).sort((a, b) => {
    if (a === 'Remote') return -1;
    if (b === 'Remote') return 1;
    return a.localeCompare(b);
  });
}

/**
 * Get location type for filtering (Remote, On-site, Hybrid)
 * @param {string} locationType - Location type from job data
 * @returns {string}
 */
export function normalizeLocationType(locationType) {
  if (!locationType) return 'Unknown';
  
  const lower = locationType.toLowerCase();
  
  if (lower.includes('remote')) return 'Remote';
  if (lower.includes('hybrid')) return 'Hybrid';
  if (lower.includes('on-site') || lower.includes('onsite') || lower.includes('in-person')) {
    return 'On-site';
  }
  
  return locationType;
}

export default {
  normalizeLocation,
  isRemote,
  getConsolidatedLocations,
  normalizeLocationType
};
