# Local Development Setup

## Environment Variables

Your `.env.local` file is already configured with all Netlify secrets for local development.

### ✅ What's Already Set Up

The `.env.local` file contains:

#### Client-Side Variables (NEXT_PUBLIC_*)
- Firebase configuration (API key, auth domain, project ID, etc.)
- Analytics keys (PostHog)
- OAuth client IDs (LinkedIn, Gmail)
- EmailJS configuration

#### Server-Side Variables (No prefix)
- OpenAI API key
- College API key
- AssemblyAI API key
- Resend API key
- Drafted API key
- GitHub token
- LinkedIn client secret
- Firebase admin credentials

### 🔒 Security

- ✅ All `.env*` files are in `.gitignore`
- ✅ Secrets are never committed to git
- ✅ Client-side variables are properly prefixed with `NEXT_PUBLIC_`
- ✅ Server-side secrets have no prefix (only accessible server-side)

### 🚀 Running Locally

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

The app will automatically load variables from `.env.local`.

### 📝 Environment Variable Structure

```
.env.local          # Local development (gitignored)
.env                # Shared defaults (gitignored)
.env.example        # Template without secrets (can be committed)
```

### 🔄 Syncing with Netlify

To pull latest secrets from Netlify:

```bash
# List current Netlify env vars
netlify env:list

# Export as JSON
netlify env:list --json

# Import from file
netlify env:import .env.local
```

### 🆕 Adding New Secrets

1. **Add to `.env.local`** for local development
2. **Add to Netlify** for production:
   ```bash
   netlify env:set VARIABLE_NAME "value"
   ```
3. **Update code** to use the variable:
   - Client-side: `process.env.NEXT_PUBLIC_VARIABLE_NAME`
   - Server-side: `process.env.VARIABLE_NAME`

### ⚠️ Important Notes

#### Client-Side Variables
- Must be prefixed with `NEXT_PUBLIC_`
- Will be bundled into JavaScript (visible to users)
- Safe for: API keys that are meant to be public (Firebase config, analytics, etc.)
- **Not safe for**: Secret API keys, tokens, passwords

#### Server-Side Variables
- No prefix needed
- Only accessible in API routes, server components, and Netlify functions
- Safe for: All secrets, API keys, tokens, credentials
- **Never** accessible from client-side code

### 🧪 Testing Environment Variables

```javascript
// In a server component or API route
console.log('OpenAI Key:', process.env.OPENAI_API_KEY); // ✅ Works

// In a client component
console.log('OpenAI Key:', process.env.OPENAI_API_KEY); // ❌ undefined
console.log('Firebase:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID); // ✅ Works
```

### 📋 Current Variables

#### Public (Client-Side)
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`
- `NEXT_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_POSTHOG_HOST`
- `NEXT_PUBLIC_EMAILJS_USER_ID`
- `NEXT_PUBLIC_EMAILJS_SERVICE_ID`
- `NEXT_PUBLIC_LINKEDIN_CLIENT_ID`
- `NEXT_PUBLIC_GMAIL_CLIENT_ID`

#### Private (Server-Side)
- `OPENAI_API_KEY`
- `COLLEGE_API_KEY`
- `ASSEMBLYAI_API_KEY`
- `RESEND_API_KEY`
- `DRAFTED_API_KEY`
- `GITHUB_TOKEN`
- `LINKEDIN_CLIENT_SECRET`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_PRIVATE_KEY`
- `GENERATE_SOURCEMAP`

### 🐛 Troubleshooting

#### Variable not found in development
1. Check `.env.local` exists and has the variable
2. Restart dev server (`npm run dev`)
3. Clear Next.js cache: `rm -rf .next`

#### Variable not found in production
1. Check Netlify dashboard: Site Settings → Environment Variables
2. Verify variable name matches exactly (case-sensitive)
3. Redeploy after adding new variables

#### Client-side variable is undefined
1. Make sure it's prefixed with `NEXT_PUBLIC_`
2. Restart dev server after adding
3. Check browser console for the value

#### Server-side variable is undefined
1. Make sure it does NOT have `NEXT_PUBLIC_` prefix
2. Only use in API routes, server components, or Netlify functions
3. Check Netlify logs if in production

### 📚 Resources

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Netlify Environment Variables](https://docs.netlify.com/environment-variables/overview/)
- [ENV_SETUP.md](./ENV_SETUP.md) - Detailed setup guide
- [DEPLOYMENT_FIX_SUMMARY.md](./DEPLOYMENT_FIX_SUMMARY.md) - Security fixes

### ✨ Quick Commands

```bash
# View all Netlify env vars
netlify env:list

# Get specific variable
netlify env:get OPENAI_API_KEY

# Set new variable
netlify env:set NEW_VARIABLE "value"

# Delete variable
netlify env:unset OLD_VARIABLE

# Import from file
netlify env:import .env.local

# Export to file
netlify env:list --json > netlify-env.json
```

## Ready to Go! 🚀

Your local development environment is fully configured. Just run `npm run dev` and start coding!
