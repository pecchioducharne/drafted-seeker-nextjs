import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';

// Cache configuration
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes
let cachedCandidates = null;
let cacheTimestamp = null;

/**
 * Fetch candidates from Firestore with optional filters
 * Implements caching to reduce redundant fetches
 */
export async function fetchCandidates(filters = {}, fetchLimit = 2000, forceRefresh = false) {
  // Check cache first
  if (!forceRefresh && cachedCandidates && cacheTimestamp) {
    const cacheAge = Date.now() - cacheTimestamp;
    if (cacheAge < CACHE_DURATION_MS) {
      console.log('Using cached candidates data');
      return cachedCandidates;
    }
  }

  try {
    // Simple query: fetch all candidates ordered by createdAt
    // All filtering is done client-side to avoid needing composite indexes
    const q = query(
      collection(db, 'drafted-accounts'),
      orderBy('createdAt', 'desc'),
      limit(fetchLimit)
    );

    console.log('Fetching candidates from Firestore...');
    const snapshot = await getDocs(q);

    const candidates = snapshot.docs.map(doc => ({
      id: doc.id,
      email: doc.id,
      ...doc.data(),
      // Convert Firestore timestamps to ISO strings for easier handling
      createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate().toISOString() : null
    }));

    // Update cache
    cachedCandidates = candidates;
    cacheTimestamp = Date.now();

    console.log(`Fetched ${candidates.length} candidates`);
    return candidates;
  } catch (error) {
    console.error('Error fetching candidates:', error);
    throw error;
  }
}

/**
 * Get count of candidates with video1
 * Uses cached candidates to avoid index requirements
 */
export async function getCandidateCountWithVideo() {
  try {
    // Use cached data if available, otherwise fetch
    const candidates = await fetchCandidates();
    return candidates.filter(c => c.video1).length;
  } catch (error) {
    console.error('Error getting candidate count:', error);
    return 0;
  }
}

/**
 * Get aggregated statistics for dashboard summary cards
 */
export async function getCandidateStats(candidates) {
  if (!candidates || candidates.length === 0) {
    return {
      totalWithVideo: 0,
      totalUniversities: 0,
      topMajors: [],
      topProgrammingLanguages: [],
      topCultureTags: [],
      avgVideosPerCandidate: 0
    };
  }

  // Count unique universities
  const universities = new Set(
    candidates
      .map(c => c.university)
      .filter(u => u && u !== 'N/A')
  );

  // Count majors
  const majorCounts = {};
  candidates.forEach(c => {
    if (c.major && c.major !== 'N/A') {
      majorCounts[c.major] = (majorCounts[c.major] || 0) + 1;
    }
  });

  // Count programming languages from skills
  const programmingLanguages = ['Python', 'JavaScript', 'Java', 'C++', 'C#', 'TypeScript', 'Swift', 'Go', 'PHP', 'Dart', 'Rust', 'SQL'];
  const langCounts = {};
  candidates.forEach(c => {
    if (c.skills && Array.isArray(c.skills)) {
      c.skills.forEach(skill => {
        if (programmingLanguages.includes(skill)) {
          langCounts[skill] = (langCounts[skill] || 0) + 1;
        }
      });
    }
  });

  // Count culture tags
  const cultureCounts = {};
  candidates.forEach(c => {
    if (c.culture?.cultureTags && Array.isArray(c.culture.cultureTags)) {
      c.culture.cultureTags.forEach(tag => {
        cultureCounts[tag] = (cultureCounts[tag] || 0) + 1;
      });
    }
  });

  // Calculate average videos per candidate
  let totalVideos = 0;
  candidates.forEach(c => {
    if (c.video1) totalVideos++;
    if (c.video2) totalVideos++;
    if (c.video3) totalVideos++;
  });

  return {
    totalWithVideo: candidates.filter(c => c.video1).length,
    totalUniversities: universities.size,
    topMajors: Object.entries(majorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([major, count]) => ({ major, count })),
    topProgrammingLanguages: Object.entries(langCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([language, count]) => ({ language, count })),
    topCultureTags: Object.entries(cultureCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag, count]) => ({ tag, count })),
    avgVideosPerCandidate: totalVideos / candidates.length
  };
}

/**
 * Clear cache (useful for forcing refresh)
 */
export function clearCandidatesCache() {
  cachedCandidates = null;
  cacheTimestamp = null;
}

/**
 * Get all unique values for a field (for filter dropdowns)
 */
export function getUniqueValues(candidates, field) {
  const values = new Set();
  candidates.forEach(c => {
    const value = c[field];
    if (value && value !== 'N/A') {
      values.add(value);
    }
  });
  return Array.from(values).sort();
}

/**
 * Get major counts for dropdown (with counts)
 */
export function getMajorOptions(candidates) {
  const majorCounts = {};
  candidates.forEach(c => {
    if (c.major && c.major !== 'N/A') {
      majorCounts[c.major] = (majorCounts[c.major] || 0) + 1;
    }
  });

  return Object.entries(majorCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([major, count]) => ({ major, count }));
}

/**
 * Get university options for dropdown (with counts)
 */
export function getUniversityOptions(candidates) {
  const universityCounts = {};
  candidates.forEach(c => {
    if (c.university && c.university !== 'N/A') {
      universityCounts[c.university] = (universityCounts[c.university] || 0) + 1;
    }
  });

  return Object.entries(universityCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([university, count]) => ({ university, count }));
}
