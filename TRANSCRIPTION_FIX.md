# Transcription & Culture Tags Fix

## Problem
- Videos were recording but no transcripts or culture tags were being generated
- Netlify functions were returning 404 errors in local development

## Root Causes
1. **Local Development**: Running `npm run dev` doesn't support Netlify functions
2. **CORS Issues**: Functions only allowed production domain, not localhost

## Fixes Applied

### 1. Updated Netlify Functions CORS
Both `transcribeVideo.js` and `askOpenAI.js` now allow:
- `http://localhost:3000` (local dev)
- `https://candidate.joindrafted.com` (production)
- `https://draftedseeker.netlify.app` (Netlify preview)

### 2. Updated npm Scripts
```json
"dev": "netlify dev",        // Now runs with Netlify functions support
"dev:next": "next dev",      // Original Next.js dev (no functions)
```

### 3. Removed Non-existent Service Imports
Removed imports for `SkillAutoAssignmentService` and `CandidateStoryService` that don't exist yet.

## How to Run Locally

### Option 1: With Netlify Functions (Recommended)
```bash
npm run dev
```
This runs `netlify dev` which:
- Starts Next.js dev server
- Runs Netlify functions locally at `/.netlify/functions/*`
- Loads environment variables from Netlify

### Option 2: Without Functions (Faster, but no transcription)
```bash
npm run dev:next
```
Use this for quick UI development when you don't need transcription/culture tags.

## Testing Transcription

1. Start dev server: `npm run dev`
2. Record a video on any video-recorder page
3. Check console for transcription logs:
   - `🎤 Starting transcription...`
   - `✅ Transcription completed`
   - `🏷️ Triggering automatic culture tag generation...`
   - `✅ Culture tags generated`

## Environment Variables Required

Make sure these are set in Netlify (already configured):
- `ASSEMBLYAI_API_KEY` - For video transcription
- `OPENAI_API_KEY` - For culture tag generation

## What Happens After Video Upload

1. **Video Upload** → Firebase Storage
2. **Transcription** → AssemblyAI (via Netlify function)
3. **Save Transcript** → Firestore `transcripts` array
4. **If Video 1** → Trigger culture tag generation
5. **Culture Tags** → OpenAI (via Netlify function)
6. **Save Tags** → Firestore `culture` object

## Troubleshooting

### Functions still returning 404?
- Make sure you're using `npm run dev` (not `npm run dev:next`)
- Check terminal shows "Lambda server is listening"

### Transcription taking too long?
- AssemblyAI can take 30-60 seconds for short videos
- Check browser console for progress logs

### No culture tags appearing?
- Culture tags only generate after video1 (position 2)
- Check Firestore for the `culture` field in your user document
- Look for errors in browser console
