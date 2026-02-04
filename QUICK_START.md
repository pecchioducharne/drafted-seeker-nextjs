# Quick Start Guide - Drafted Seeker Next.js

## 🚀 Running the App Locally

### For Full Functionality (with transcription & culture tags)
```bash
npm run dev
```
This runs `netlify dev` which includes Netlify functions support.

### For Quick UI Development (no backend features)
```bash
npm run dev:next
```
Faster startup, but transcription/culture tags won't work.

## 🔑 Environment Variables

All environment variables are managed through Netlify. To sync them locally:

```bash
netlify env:list
```

The app uses:
- **Client-side** (prefixed with `NEXT_PUBLIC_`): Firebase config
- **Server-side**: API keys for AssemblyAI, OpenAI, Resend

## 🎥 Features

### Video Recording
- 3 video questions with screen recording support
- Auto-start recording when screen share begins
- Question tips and AI talking points

### Transcription & Culture Tags
1. Record videos → Auto-transcribed via AssemblyAI
2. After video1 → Culture tags auto-generated via OpenAI
3. View culture tags in dashboard with purple gradient styling

### Resume Upload
- Upload during onboarding or in dashboard
- Auto-parse PDF, DOCX, TXT files
- Extract experience, education, skills

### Profile Management
- Edit profile info with autocomplete for major/year
- View and regenerate culture tags
- Upload/replace resume

## 📁 Key Files

### Components
- `/components/video/` - Video recorder components
- `/components/dashboard/` - Dashboard UI
- `/components/onboarding/` - Onboarding flow

### Services
- `/lib/services/TranscriptionService.js` - Video transcription
- `/lib/services/CultureTagService.js` - Culture tag generation
- `/lib/utils/resumeParser.js` - Resume parsing

### Netlify Functions
- `/netlify/functions/transcribeVideo.js` - AssemblyAI proxy
- `/netlify/functions/askOpenAI.js` - OpenAI proxy

## 🐛 Troubleshooting

### Netlify functions returning 404?
- Use `npm run dev` (not `npm run dev:next`)
- Check terminal shows "Lambda server is listening"

### Build errors about missing services?
- Fixed: Removed non-existent service imports
- TranscriptionService now only imports CultureTagService

### Videos not transcribing?
- Check ASSEMBLYAI_API_KEY is set in Netlify
- Transcription takes 30-60 seconds
- Check browser console for logs

### Culture tags not generating?
- Only generates after video1 (position 2)
- Check OPENAI_API_KEY is set in Netlify
- View Firestore `culture` field in user document

## 🚢 Deployment

```bash
# Build locally
npm run build

# Deploy to Netlify
git push origin main
```

Netlify auto-deploys from main branch.

## 📚 Documentation

- `ENV_SETUP.md` - Environment variable setup
- `TRANSCRIPTION_FIX.md` - Transcription troubleshooting
- `IMPLEMENTATION_COMPLETE.md` - Feature implementation details
