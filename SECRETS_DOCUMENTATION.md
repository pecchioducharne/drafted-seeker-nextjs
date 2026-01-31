# Drafted Seeker App - Environment Variables & Secrets Documentation

This document lists all required environment variables and API keys for the Drafted Seeker Next.js application to function properly.

## Required Environment Variables

### Firebase Configuration (REQUIRED)
These are publicly accessible and safe to expose in client-side code:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCmQRXoSyXy5rGm8JjF5JGH_eFQibKW_0g
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=drafted-6c302.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=drafted-6c302
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=drafted-6c302.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=739427449972
NEXT_PUBLIC_FIREBASE_APP_ID=1:739427449972:web:c02c6a8cdf544c30e52521
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-2C3DWJC6W6
```

**Where to get:**
- Firebase Console → Project Settings → General
- These values are already configured for the `drafted-6c302` project

---

### OpenAI API Key (REQUIRED for Script Generation)
**Critical for:** Video script generation, AI-powered features

```env
OPENAI_API_KEY=your_openai_api_key_here
```

**Where to get:**
1. Go to https://platform.openai.com/api-keys
2. Create a new API key or use existing service account key
3. **IMPORTANT:** This is a server-side secret - do NOT prefix with `NEXT_PUBLIC_`

**Current Key Location:**
- Already configured in `.env.local`
- Must also be added to Netlify Environment Variables

**Features dependent on this:**
- ✅ Script Tips Panel in video recorders
- ✅ AI-generated talking points for video answers
- ✅ Role assignment based on profile data (fallback to keyword matching if unavailable)

---

### Analytics - PostHog (REQUIRED)

```env
NEXT_PUBLIC_POSTHOG_KEY=phc_LndLN4b8o0tES8TMi5og8jYHf32uSNCfGi8aVd8eKwK
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

**Where to get:**
- PostHog Dashboard → Project Settings → API Keys
- Already configured for Drafted project

**Features dependent on this:**
- User analytics and tracking
- Product analytics
- Feature usage monitoring

---

### Email Services - EmailJS (REQUIRED for Email Features)

```env
NEXT_PUBLIC_EMAILJS_USER_ID=RfdLlpPTsLae8Wd_j
NEXT_PUBLIC_EMAILJS_SERVICE_ID=drafted_service
```

**Where to get:**
- EmailJS Dashboard → Account → API Keys
- Service ID from EmailJS → Email Services

**Features dependent on this:**
- ✅ Sending nudges to recruiters
- ✅ Email outreach functionality
- ✅ Contact forms

---

### OAuth - LinkedIn (REQUIRED for LinkedIn Features)

```env
NEXT_PUBLIC_LINKEDIN_CLIENT_ID=7816fipmhhnef7
LINKEDIN_CLIENT_SECRET=<your_secret_here>
```

**Where to get:**
1. LinkedIn Developers: https://www.linkedin.com/developers/apps
2. Create or select your app
3. Copy Client ID and Client Secret from Auth tab

**IMPORTANT:** Client Secret must be added to Netlify Environment Variables (not in .env.local)

**Features dependent on this:**
- LinkedIn profile import
- LinkedIn OAuth authentication
- Auto-fill profile data from LinkedIn

---

### OAuth - Gmail (REQUIRED for Gmail Features)

```env
NEXT_PUBLIC_GMAIL_CLIENT_ID=739427449972-6s8fmdj241khfictl9hn6gor932l4u20.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=<your_secret_here>
```

**Where to get:**
1. Google Cloud Console: https://console.cloud.google.com/
2. Navigate to APIs & Services → Credentials
3. Select OAuth 2.0 Client ID
4. Copy Client ID and Client Secret

**IMPORTANT:** Client Secret must be added to Netlify Environment Variables (not in .env.local)

**Features dependent on this:**
- Gmail OAuth for email sending
- Email integration features
- Automated email outreach

---

## Optional/Future Environment Variables

### Resend API (For future email features)

```env
VITE_RESEND_API_KEY=<your_key_here>
```

**Where to get:**
- Resend Dashboard: https://resend.com/api-keys

**Status:** Not currently implemented, placeholder for future use

---

### University API (For university data)

```env
COLLEGE_API_KEY=<your_key_here>
```

**Where to get:**
- Contact the College/University data provider
- Or use alternative university database API

**Status:** Optional - university autocomplete works without this

---

### AssemblyAI (For future video transcription)

```env
ASSEMBLYAI_API_KEY=<your_key_here>
```

**Where to get:**
- AssemblyAI Dashboard: https://www.assemblyai.com/app/account

**Status:** Not currently implemented, placeholder for future video transcription features

---

### Typesense (For future search features)

```env
NEXT_PUBLIC_TYPESENSE_HOST=<your_host>
NEXT_PUBLIC_TYPESENSE_SEARCH_KEY=<search_key>
TYPESENSE_ADMIN_KEY=<admin_key>
```

**Where to get:**
- Typesense Cloud Dashboard or self-hosted instance

**Status:** Not currently implemented, placeholder for future advanced search

---

## Netlify-Specific Configuration

### Where to Add Secrets in Netlify:

1. Go to your Netlify site dashboard
2. Navigate to **Site settings** → **Environment variables**
3. Add the following server-side secrets:
   - `OPENAI_API_KEY`
   - `LINKEDIN_CLIENT_SECRET`
   - `GMAIL_CLIENT_SECRET`

### Netlify Functions

The following Netlify functions require environment variables:

1. **`askOpenAI.js`** - Requires: `OPENAI_API_KEY`
   - Purpose: AI script generation for video recorder
   - Called by: ScriptTipsPanel component

2. **`searchUniversities.js`** - Optional: `COLLEGE_API_KEY`
   - Purpose: University autocomplete
   - Works without API key using fallback data

---

## Testing Checklist

### After adding all environment variables, test these features:

- [ ] **Firebase Authentication** - Login/signup works
- [ ] **Profile Data** - User data saves and loads correctly
- [ ] **Video Upload** - Videos save to Firebase Storage
- [ ] **Script Generation** - Click "Generate Script Tips" in video recorder
- [ ] **Email Sending** - Test "Nudge" feature on company pages
- [ ] **LinkedIn Import** - Test LinkedIn OAuth flow
- [ ] **Analytics** - Check PostHog dashboard for events
- [ ] **Role Assignment** - Check if roles are assigned correctly
- [ ] **Company Filters** - Test "All Companies" and "Data Jobs" filters
- [ ] **University Favicon** - Check if university logos appear

---

## Security Best Practices

1. **Never commit `.env.local` to version control**
   - Already in `.gitignore`

2. **Server-side secrets** (no `NEXT_PUBLIC_` prefix):
   - `OPENAI_API_KEY`
   - `LINKEDIN_CLIENT_SECRET`
   - `GMAIL_CLIENT_SECRET`
   - `ASSEMBLYAI_API_KEY` (future)
   - `TYPESENSE_ADMIN_KEY` (future)

3. **Client-side variables** (with `NEXT_PUBLIC_` prefix):
   - All Firebase config
   - PostHog keys
   - EmailJS user ID
   - OAuth Client IDs (but NOT secrets!)

4. **Netlify Functions Only:**
   - Server-side secrets should only be accessed in Netlify Functions
   - Never expose them in client-side code

---

## Feature Dependencies Summary

### Critical (App won't work without these):
- ✅ Firebase Configuration
- ✅ OpenAI API Key (for script generation)
- ✅ EmailJS Configuration (for nudges)

### Important (Features will be limited):
- ⚠️ LinkedIn OAuth (profile import won't work)
- ⚠️ Gmail OAuth (some email features won't work)
- ⚠️ PostHog (analytics won't work)

### Optional (Future features):
- ℹ️ Resend API
- ℹ️ College API
- ℹ️ AssemblyAI
- ℹ️ Typesense

---

## Support

If you're missing any credentials or having issues:

1. Check Netlify environment variables are set
2. Verify `.env.local` file exists and is properly formatted
3. Restart development server after adding new variables
4. Check browser console for API key errors
5. Verify Firebase rules allow your operations

---

## Last Updated

January 26, 2026

**Verified Working:**
- Firebase authentication and storage
- OpenAI script generation
- Company search and filters
- Video recording and playback
- Dashboard with all new features
