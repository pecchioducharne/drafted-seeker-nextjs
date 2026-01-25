// Helper functions used across components

// State abbreviations mapping
export const STATE_ABBREVIATIONS = {
  'Alabama': 'AL',
  'Alaska': 'AK',
  'Arizona': 'AZ',
  'Arkansas': 'AR',
  'California': 'CA',
  'Colorado': 'CO',
  'Connecticut': 'CT',
  'Delaware': 'DE',
  'Florida': 'FL',
  'Georgia': 'GA',
  'Hawaii': 'HI',
  'Idaho': 'ID',
  'Illinois': 'IL',
  'Indiana': 'IN',
  'Iowa': 'IA',
  'Kansas': 'KS',
  'Kentucky': 'KY',
  'Louisiana': 'LA',
  'Maine': 'ME',
  'Maryland': 'MD',
  'Massachusetts': 'MA',
  'Michigan': 'MI',
  'Minnesota': 'MN',
  'Mississippi': 'MS',
  'Missouri': 'MO',
  'Montana': 'MT',
  'Nebraska': 'NE',
  'Nevada': 'NV',
  'New Hampshire': 'NH',
  'New Jersey': 'NJ',
  'New Mexico': 'NM',
  'New York': 'NY',
  'North Carolina': 'NC',
  'North Dakota': 'ND',
  'Ohio': 'OH',
  'Oklahoma': 'OK',
  'Oregon': 'OR',
  'Pennsylvania': 'PA',
  'Rhode Island': 'RI',
  'South Carolina': 'SC',
  'South Dakota': 'SD',
  'Tennessee': 'TN',
  'Texas': 'TX',
  'Utah': 'UT',
  'Vermont': 'VT',
  'Virginia': 'VA',
  'Washington': 'WA',
  'West Virginia': 'WV',
  'Wisconsin': 'WI',
  'Wyoming': 'WY'
};

export const LOCATION_MAPPINGS = {
  // States
  'CA': '🏖️',
  'NY': '🗽',
  'FL': '🏖️',
  'TX': '🤠',
  'WA': '☔',
  'MA': '🎓',
  'CO': '⛰️',
  'IL': '🌆',
  'GA': '🍑',
  'NC': '🌲',
  'OR': '🌲',
  'AZ': '🌵',
  'NV': '🎰',
  'HI': '🌺',
  'California': '🏖️',
  'New York': '🗽',
  'Florida': '🏖️',
  'Texas': '🤠',
  'Washington': '☔',
  'Massachusetts': '🎓',
  'Colorado': '⛰️',
  'Illinois': '🌆',
  'Georgia': '🍑',
  'North Carolina': '🌲',
  'Oregon': '🌲',
  'Arizona': '🌵',
  'Nevada': '🎰',
  'Hawaii': '🌺',

  // Cities
  'San Francisco': '🌉',
  'New York City': '🗽',
  'Miami': '🏖️',
  'Seatle': '☔',
  'Boston': '🎓',
  'Chicago': '🌆',
  'Austin': '🤠',
  'Denver': '⛰️',
  'Las Vegas': '🎰',
  'Palo Alto': '💻',
  'Bay Area': '🌉',
  'Remote': '🏠',
  'Anywhere': '🌎'
};

// Utility function to strip emojis from strings
export const stripEmojis = (str) => {
  return str?.replace(/[\u{1F300}-\u{1F9FF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{1F191}-\u{1F251}]|[\u{1F004}]|[\u{1F0CF}]|[\u{1F170}-\u{1F171}]|[\u{1F17E}-\u{1F17F}]|[\u{1F18E}]|[\u{3030}]|[\u{2B50}]|[\u{2B55}]|[\u{2934}-\u{2935}]|[\u{2B05}-\u{2B07}]|[\u{2B1B}-\u{2B1C}]|[\u{3297}]|[\u{3299}]|[\u{303D}]|[\u{00A9}]|[\u{00AE}]|[\u{2122}]/gu, '')
    .trim();
};

// Normalize string for searching
export const normalizeString = (str) => {
  if (!str) return '';
  return stripEmojis(str)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' '); // Replace multiple spaces with single space
};

// Get location with emoji
export const getLocationWithEmoji = (location) => {
  if (!location) return "Anywhere 🌎";

  const [city, state] = location.split(',').map(part => part.trim());

  // Convert longform state name to abbreviation if necessary
  const stateAbbreviation = STATE_ABBREVIATIONS[state] || state;

  // First try to match city (case insensitive)
  const cityMatch = Object.keys(LOCATION_MAPPINGS).find(
    key => key.toLowerCase() === city.toLowerCase()
  );

  if (cityMatch) {
    return `${city}, ${stateAbbreviation} ${LOCATION_MAPPINGS[cityMatch]}`;
  }

  // If no city match, try to match state abbreviation
  const stateMatch = Object.keys(LOCATION_MAPPINGS).find(
    key => key.toLowerCase() === stateAbbreviation.toLowerCase()
  );

  if (stateMatch) {
    return `${city}, ${stateAbbreviation} ${LOCATION_MAPPINGS[stateMatch]}`;
  }

  // If no matches, return with default emoji
  return `${city}, ${stateAbbreviation} 📍`;
};

// Shuffle array function
export const shuffleArray = (array) => {
  // Create a copy of the array to avoid mutating the original
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Function to convert email to HTML format
export const convertEmailToHtml = (textEmail, companyName) => {
  // Parse sections from the text email
  const lines = textEmail.split('\n');
  let htmlContent = '<div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">';

  // Track added links to prevent duplicates
  const addedLinks = new Set();

  // Process lines and convert to HTML with proper formatting
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip empty lines but add paragraph breaks
    if (line.trim() === '') {
      continue; // Remove extra breaks to fix spacing
    }

    // Handle the profile link
    if (line.includes('View my full profile & video resume here:')) {
      const profileUrl = line.split('here:')[1]?.trim();
      if (profileUrl && !addedLinks.has(profileUrl)) {
        htmlContent += `<p>View my full profile & video resume here: <a href="${profileUrl}" style="color: #00875A; font-weight: bold; text-decoration: none;">${profileUrl}</a></p>`;
        addedLinks.add(profileUrl);
      }
      continue;
    }

    // Handle the credentials section
    if (line.includes('Quick access to my credentials')) {
      htmlContent += '<p>Quick access to my credentials:</p>';
      continue;
    }

    // Handle LinkedIn, GitHub, and Resume links
    if (line.includes('LinkedIn:') || line.includes('GitHub:') || line.includes('Resume:')) {
      const [label, url] = line.split(':').map(part => part.trim());
      if (url && !addedLinks.has(url)) {
        const color = label === 'LinkedIn' ? '#0A66C2' : label === 'GitHub' ? '#24292F' : '#00875A';
        const emoji = label === 'LinkedIn' ? '🔗' : label === 'GitHub' ? '💻' : '📄';
        htmlContent += `<p>${emoji} ${label}: <a href="${url}" style="color: ${color}; text-decoration: none; font-weight: 500;">${url}</a></p>`;
        addedLinks.add(url);
      }
      continue;
    }

    // Handle footer (text with underscores to indicate italics)
    if (line.startsWith('_') && line.endsWith('_')) {
      const footerText = line.substring(1, line.length - 1);
      if (footerText.includes('joindrafted.com')) {
        htmlContent += `<p style="font-style: italic; margin-top: 15px; margin-bottom: 5px;">${footerText.replace('joindrafted.com', '<a href="https://joindrafted.com" style="color: #00875A; font-weight: bold; text-decoration: none;">joindrafted.com</a>')}</p>`;
        continue;
      }
    }

    // Handle regular text as paragraphs
    htmlContent += `<p>${line}</p>`;
  }

  htmlContent += '</div>';
  return htmlContent;
};

// Format number with commas
export const formatNumber = (num) => {
  return num.toLocaleString();
};

// Check nudge cooldown
export const checkNudgeCooldown = (nudges, companyName) => {
  if (!nudges || !Array.isArray(nudges)) return { inCooldown: false };
  
  // Find the most recent nudge for this company
  const companyNudge = nudges.find(nudge => nudge.company === companyName);
  
  if (!companyNudge) return { inCooldown: false };
  
  const now = Date.now();
  const nudgeTime = companyNudge.nudgedAt;
  const diffMs = now - nudgeTime;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const remainingDays = 14 - diffDays; // Changed from 5 to 14 days
  
  if (remainingDays <= 0) return { inCooldown: false };
  
  // Calculate remaining hours
  const remainingMs = (14 * 24 * 60 * 60 * 1000) - diffMs; // Changed from 5 to 14 days
  const remainingHours = Math.floor((remainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  return { 
    inCooldown: true, 
    remainingDays, 
    remainingHours 
  };
};

// Get favicon for a website with fallback
export const getFavicon = (url) => {
  if (!url) return null;
  try {
    const domain = new URL(url).hostname;
    // Use a more reliable favicon service with fallback
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch {
    return null;
  }
};

// Get a fallback icon for companies without favicons
export const getFallbackIcon = (companyName) => {
  // Use a simple, consistent generic building icon
  return '🏢';
};

// Debounce function
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
}; 