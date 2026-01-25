// Gmail API Integration constants
export const CLIENT_ID = '739427449972-6s8fmdj241khfictl9hn6gor932l4u20.apps.googleusercontent.com';
export const SCOPE = 'https://www.googleapis.com/auth/gmail.send';

// Email service constants
export const EMAIL_SERVICE_ID = "drafted_brevo";
export const EMAIL_TEMPLATE_ID = "recruiter_nudge_template";
export const CONFIRMATION_TEMPLATE_ID = "nudge_confirmation";

// Enhanced email sending limits with adaptive configuration
export const EMAIL_LIMITS = {
  BATCH_SIZE_MIN: 8,
  BATCH_SIZE_MAX: 25,              // Increased max batch size
  BATCH_SIZE_DEFAULT: 15,          // Increased default batch size
  DELAY_BETWEEN_EMAILS_MIN: 800,   // 0.8 seconds (faster for mass nudge)
  DELAY_BETWEEN_EMAILS_MAX: 3000,  // 3 seconds  
  DELAY_BETWEEN_EMAILS_DEFAULT: 1200, // 1.2 seconds (faster default)
  DELAY_BETWEEN_BATCHES: 180000,   // 3 minutes (reduced from 5 minutes)
  MAX_DAILY_EMAILS: 100,           // Increased daily limit for mass nudge
  MAX_RETRIES: 3,
  TIMEOUT_MS: 30000,               // 30 second timeout
  RATE_LIMIT_BACKOFF_MS: 60000,    // 1 minute backoff on rate limit
  
  // New settings for handling thousands of emails
  BACKGROUND_JOB_THRESHOLD: 50,    // Use background job for >50 emails
  MASS_NUDGE_MAX_PER_DAY: 500,     // Allow up to 500 emails per day for mass nudge
  BACKGROUND_BATCH_SIZE: 12,       // Batch size for background jobs
  BACKGROUND_DELAY_BETWEEN_BATCHES: 3600000, // 1 hour between background batches
};

// Legacy constants for backward compatibility
export const BATCH_SIZE = EMAIL_LIMITS.BATCH_SIZE_DEFAULT;
export const DELAY_BETWEEN_EMAILS = EMAIL_LIMITS.DELAY_BETWEEN_EMAILS_DEFAULT;
export const DELAY_BETWEEN_BATCHES = EMAIL_LIMITS.DELAY_BETWEEN_BATCHES;
export const MAX_DAILY_EMAILS = EMAIL_LIMITS.MAX_DAILY_EMAILS;

// Authentication configuration
export const AUTH_CONFIG = {
  POPUP_WIDTH: 500,
  POPUP_HEIGHT: 600,
  AUTH_TIMEOUT_MS: 300000,  // 5 minutes
  TOKEN_REFRESH_BUFFER_MS: 300000,  // 5 minutes before expiry
  MAX_AUTH_RETRIES: 2
};

// Email message variations for personalization
export const MESSAGE_VARIATIONS = [
  "I was able to find {company} and send this message through joindrafted.com, a platform that connects driven candidates like me with companies like yours.",
  "I discovered {company} through joindrafted.com, a platform connecting motivated candidates with innovative companies.",
  "I'm reaching out via joindrafted.com, which helped me discover {company} as a potential match for my skills and interests.",
  "This connection was made possible by joindrafted.com, which helped me identify {company} as an exciting opportunity.",
  "joindrafted.com connected me with {company}, and I'm excited about the possibility of contributing to your team.",
  "Through joindrafted.com, I identified {company} as a company where my skills and passion could make a real impact.",
  "I found {company} via joindrafted.com and was immediately drawn to your mission and values.",
  "joindrafted.com helped me discover {company}, and I'm excited about the possibility of joining your talented team."
];

// Cool down period for nudges in days
export const NUDGE_COOLDOWN_DAYS = 14;

// Email quality thresholds
export const EMAIL_QUALITY = {
  MIN_SUBJECT_LENGTH: 10,
  MAX_SUBJECT_LENGTH: 200,
  MIN_BODY_LENGTH: 100,
  MAX_BODY_LENGTH: 50000,
  MAX_SPAM_SCORE: 2
};

// Progress tracking constants
export const PROGRESS_CONFIG = {
  UPDATE_INTERVAL_MS: 1000,
  PERSIST_PROGRESS: true,
  SHOW_DETAILED_ERRORS: true,
  MAX_ERROR_DISPLAY: 10
}; 