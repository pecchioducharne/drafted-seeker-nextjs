# Environment Variables Setup Guide

This document explains how to configure environment variables for the Drafted Seeker application in both local development and production (Netlify).

## 🔐 Security Best Practices

- **Client-side variables** (prefixed with `NEXT_PUBLIC_`) are bundled into JavaScript and visible to users
- **Server-side variables** (no prefix) are only accessible in API routes, server components, and Netlify functions
- **Never** put sensitive API keys in client-side code or prefix them with `NEXT_PUBLIC_`

## 📋 Required Environment Variables

### For Netlify Production

Add these in the Netlify dashboard under **Site settings → Environment variables**.

**Note:** Replace the placeholder values below with your actual API keys and secrets. If you already have these configured in Netlify, you can retrieve them using:
```bash
netlify env:list --json
```

```bash
# Firebase Admin (Server-side only)
FIREBASE_CLIENT_EMAIL=your-firebase-service-account@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Firebase-Private-Key-Here\n-----END PRIVATE KEY-----"
FIREBASE_PROJECT_ID=your-firebase-project-id

# API Keys (Server-side only)
OPENAI_API_KEY=sk-proj-your-openai-key-here
COLLEGE_API_KEY=your-college-api-key-here
ASSEMBLYAI_API_KEY=your-assemblyai-key-here
RESEND_API_KEY=re_your-resend-key-here
DRAFTED_API_KEY=your-drafted-api-key-here

# OAuth Secrets (Server-side only)
GITHUB_TOKEN=ghp_your-github-token-here
LINKEDIN_CLIENT_SECRET=your-linkedin-secret-here

# Build Configuration
GENERATE_SOURCEMAP=false

# Firebase Client Config (Safe to expose - these identify your project but don't grant access)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCmQRXoSyXy5rGm8JjF5JGH_eFQibKW_0g
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=drafted-6c302.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=drafted-6c302
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=drafted-6c302.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=739427449972
NEXT_PUBLIC_FIREBASE_APP_ID=1:739427449972:web:c02c6a8cdf544c30e52521
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-2C3DWJC6W6

# Analytics (Client-side)
NEXT_PUBLIC_POSTHOG_KEY=phc_LndLN4b8o0tES8TMi5og8jYHf32uSNCfGi8aVd8eKwK
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# OAuth Client IDs (Client-side - these are public)
NEXT_PUBLIC_LINKEDIN_CLIENT_ID=7816fipmhhnef7
NEXT_PUBLIC_GMAIL_CLIENT_ID=739427449972-6s8fmdj241khfictl9hn6gor932l4u20.apps.googleusercontent.com

# Email Services (Client-side)
NEXT_PUBLIC_EMAILJS_USER_ID=RfdLlpPTsLae8Wd_j
NEXT_PUBLIC_EMAILJS_SERVICE_ID=drafted_service
```

### For Local Development

Copy `.env.local` to your local environment. The file already contains the necessary variables.

## 🚀 Adding Variables to Netlify

### Option 1: Via Netlify CLI (Recommended)

```bash
# Navigate to the project
cd drafted-seeker-nextjs

# Link to your Netlify site (if not already linked)
netlify link

# Set individual variables
netlify env:set OPENAI_API_KEY "your-key-here"
netlify env:set RESEND_API_KEY "your-key-here"

# Or import from a .env file
netlify env:import .env
```

### Option 2: Via Netlify Dashboard

1. Go to https://app.netlify.com
2. Select your site (drafted-seeker)
3. Go to **Site settings → Environment variables**
4. Click **Add a variable** or **Import from a .env file**
5. Add each variable with its value
6. Deploy your site

## 🔍 Secrets Scanning

Netlify automatically scans your build output for exposed secrets. Our `netlify.toml` is configured to:

- Allow Firebase public config values (they're meant to be public)
- Block actual API keys and secrets from being bundled into client code

If you get a secrets scanning error:

1. **Check if the secret is in client-side code** - Move it to server-side (API routes/Netlify functions)
2. **Use the correct prefix** - Server secrets should NOT have `NEXT_PUBLIC_` prefix
3. **Review the error** - Netlify will tell you which files contain the exposed secrets

## 📝 Variable Usage Examples

### ✅ Correct: Server-side API call

```javascript
// netlify/functions/sendEmail.js
exports.handler = async (event) => {
  const apiKey = process.env.RESEND_API_KEY; // Server-side only
  // ... use the key
};
```

### ✅ Correct: Client calls server

```javascript
// components/MyComponent.js
'use client';

async function sendEmail() {
  // Client calls your API route, which uses the secret server-side
  const response = await fetch('/.netlify/functions/sendEmail', {
    method: 'POST',
    body: JSON.stringify({ to: 'user@example.com' })
  });
}
```

### ❌ Wrong: Secret in client code

```javascript
// components/MyComponent.js
'use client';

const apiKey = process.env.RESEND_API_KEY; // ❌ This will be bundled into client JS!
```

## 🔧 Troubleshooting

### Build fails with "Secrets scanning found secrets in build"

This means a secret value is being bundled into your client-side JavaScript. To fix:

1. Check which file contains the secret (Netlify will list them)
2. Move the API call to a Netlify function or API route
3. Update your client code to call that function instead
4. Ensure the secret doesn't have `NEXT_PUBLIC_` prefix

### Environment variable not found in Netlify function

1. Make sure the variable is set in Netlify (not just locally)
2. Redeploy your site after adding new variables
3. Check the variable name matches exactly (case-sensitive)

## 📚 Additional Resources

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Netlify Environment Variables](https://docs.netlify.com/environment-variables/overview/)
- [Netlify Secrets Scanning](https://docs.netlify.com/security/secret-scanning/)
