/**
 * Language Extractor Utility
 * Extracts spoken languages from candidate transcripts
 */

const LANGUAGE_KEYWORDS = {
  spanish: ['spanish', 'español', 'castellano'],
  french: ['french', 'français', 'francais'],
  mandarin: ['mandarin', 'chinese', '中文'],
  german: ['german', 'deutsch'],
  japanese: ['japanese', '日本語'],
  korean: ['korean', '한국어'],
  italian: ['italian', 'italiano'],
  portuguese: ['portuguese', 'português', 'portugues'],
  russian: ['russian', 'русский'],
  arabic: ['arabic', 'عربي'],
  hindi: ['hindi', 'हिन्दी'],
  english: ['english']
};

const FLUENCY_INDICATORS = [
  'speak', 'speaking', 'fluent', 'native', 'bilingual', 'proficient',
  'conversational', 'intermediate', 'advanced', 'mother tongue',
  'language', 'languages', 'tongue'
];

/**
 * Extract languages from transcript text
 * @param {Array<string>} transcripts - Array of transcript strings
 * @returns {Array<string>} - Array of detected language names (capitalized)
 */
export function extractLanguagesFromTranscript(transcripts) {
  if (!transcripts || !Array.isArray(transcripts)) {
    return [];
  }

  // Join all transcripts and normalize
  const text = transcripts
    .filter(t => t && typeof t === 'string')
    .join(' ')
    .toLowerCase();

  if (!text.trim()) {
    return [];
  }

  const detected = new Set();

  // Check each language
  Object.entries(LANGUAGE_KEYWORDS).forEach(([lang, keywords]) => {
    keywords.forEach(keyword => {
      // Create pattern to find language near fluency indicators
      // Matches: "I speak Spanish", "fluent in French", "Spanish speaker", etc.
      const pattern = new RegExp(
        `(${FLUENCY_INDICATORS.join('|')})\\s+\\w*\\s*${keyword}|${keyword}\\s+\\w*\\s*(${FLUENCY_INDICATORS.join('|')})`,
        'i'
      );

      if (pattern.test(text)) {
        detected.add(lang);
      }
    });
  });

  // Convert to capitalized names
  return Array.from(detected).map(lang =>
    lang.charAt(0).toUpperCase() + lang.slice(1)
  ).sort();
}

/**
 * Get all supported language options for filter dropdown
 * @returns {Array<string>} - Array of language names
 */
export function getSupportedLanguages() {
  return Object.keys(LANGUAGE_KEYWORDS)
    .map(lang => lang.charAt(0).toUpperCase() + lang.slice(1))
    .sort();
}

/**
 * Get programming languages from skills array
 * @param {Array<string>} skills - Skills array from candidate
 * @returns {Array<string>} - Array of programming languages
 */
export function extractProgrammingLanguages(skills) {
  if (!skills || !Array.isArray(skills)) {
    return [];
  }

  const programmingLanguages = [
    'Python', 'JavaScript', 'Java', 'C++', 'C#', 'TypeScript',
    'Swift', 'Go', 'PHP', 'Dart', 'Rust', 'SQL'
  ];

  return skills.filter(skill => programmingLanguages.includes(skill));
}

/**
 * Get all programming language options for filter dropdown
 * @returns {Array<string>} - Array of programming language names
 */
export function getProgrammingLanguages() {
  return [
    'Python', 'JavaScript', 'Java', 'C++', 'C#', 'TypeScript',
    'Swift', 'Go', 'PHP', 'Dart', 'Rust', 'SQL'
  ];
}

/**
 * Get canonical culture tags for filter dropdown
 * @returns {Array<string>} - Array of culture tag names
 */
export function getCultureTags() {
  return [
    'Integrity', 'Innovation', 'Teamwork', 'Customer Obsession', 'Accountability',
    'Transparency', 'Fast Learning', 'Resilience', 'Respect', 'Excellence',
    'Adaptability', 'Leadership', 'Creativity', 'Communication', 'Out of the Box Thinking'
  ].sort();
}
