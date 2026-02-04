# Migration from AssemblyAI to Deepgram

## Overview
Switched transcription service from AssemblyAI to Deepgram for more reliable and cost-effective video transcription.

## Changes Made

### 1. **Added Deepgram API Key**
```bash
DEEPGRAM_API_KEY=2e8d5ef59d99d76a13bee99350f2c0c129ef32d1
```

**Stored in:**
- ✅ Netlify environment variables (production, dev, deploy-preview)
- ✅ `.env.local` (local development)

### 2. **Updated transcribeVideo.js Netlify Function**

#### Key Differences from AssemblyAI:

| Feature | AssemblyAI | Deepgram |
|---------|------------|----------|
| **API Endpoint** | `api.assemblyai.com/v2/transcript` | `api.deepgram.com/v1/listen` |
| **Processing** | Async (polling required) | Synchronous (immediate response) |
| **Authorization** | `authorization: apiKey` | `Authorization: Token ${apiKey}` |
| **Request Body** | `{ audio_url: url }` | `{ url: url }` |
| **Response Path** | `data.text` | `data.results.channels[0].alternatives[0].transcript` |
| **Timeout Handling** | 10 min polling loop | Direct response (no polling) |

#### Deepgram Configuration:
```javascript
// Using Nova-2 model with smart formatting
const url = 'https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&punctuate=true&diarize=false';

// Request format
{
  url: videoURL  // Firebase Storage URL
}

// Response format
{
  results: {
    channels: [{
      alternatives: [{
        transcript: "transcribed text here..."
      }]
    }]
  }
}
```

### 3. **Benefits of Deepgram**

✅ **Faster**: Synchronous response (no polling loop)  
✅ **Simpler**: Single API call instead of submit + poll  
✅ **More Reliable**: No async job tracking needed  
✅ **Better Accuracy**: Nova-2 model with smart formatting  
✅ **Cost Effective**: Pay-as-you-go pricing  

### 4. **Model Selection: Nova-2**

Chosen for:
- **High accuracy** on conversational speech
- **Smart formatting** (automatic punctuation, capitalization)
- **Fast processing** for short-form videos (30s - 3min)
- **Multi-language support** (for future expansion)

Reference: [Deepgram Models](https://developers.deepgram.com/docs/models-languages-overview)

### 5. **Query Parameters Used**

```
model=nova-2           # High-accuracy conversational model
smart_format=true      # Automatic formatting, punctuation, capitalization
punctuate=true         # Add punctuation marks
diarize=false          # Single speaker (candidates speaking alone)
```

## Testing

### Local Development:
```bash
npm run dev  # Uses netlify dev
```

### Test Transcription:
1. Record a video on any video-recorder page
2. Check terminal for logs:
   ```
   🎤 Starting Deepgram transcription for video URL: ...
   ✅ Deepgram transcription completed successfully
   📝 Transcript length: 245 characters
   ```
3. Dashboard should show culture tag loader
4. Tags appear automatically when generation completes

## API Documentation

- **Deepgram Docs**: https://developers.deepgram.com/home
- **Pre-recorded Audio**: https://developers.deepgram.com/docs/pre-recorded-audio
- **API Reference**: https://developers.deepgram.com/reference/deepgram-api-overview

## Error Handling

### Previous Issue (AssemblyAI):
```
❌ AssemblyAI submission failed: 
{"error": "Your current account balance is negative..."}
```

### Now (Deepgram):
- API key is active and funded
- Immediate error responses (no waiting for polling)
- Clear error messages in logs

## Code Changes Summary

### Files Modified:
1. `netlify/functions/transcribeVideo.js` - Switched to Deepgram API
2. `.env.local` - Added `DEEPGRAM_API_KEY`

### Files Unchanged:
- `lib/services/TranscriptionService.js` - Still calls same Netlify function
- `lib/services/CultureTagService.js` - No changes needed
- All UI components - No changes needed

## Environment Variables

### Required for Transcription:
```bash
DEEPGRAM_API_KEY=2e8d5ef59d99d76a13bee99350f2c0c129ef32d1
```

### Required for Culture Tags:
```bash
OPENAI_API_KEY=sk-proj-...  # Already configured
```

## Migration Checklist

- [x] Add Deepgram API key to Netlify
- [x] Add Deepgram API key to `.env.local`
- [x] Update `transcribeVideo.js` to use Deepgram API
- [x] Remove polling logic (synchronous now)
- [x] Update response parsing
- [x] Test with local development
- [ ] Test recording a video
- [ ] Verify transcript saves to Firestore
- [ ] Verify culture tags generate automatically

## Rollback Plan

If issues arise, revert to AssemblyAI:
1. The old AssemblyAI code is preserved in git history
2. API key still exists in environment variables
3. Simple function replacement to rollback

## Performance Expectations

### Video Length → Processing Time:
- **30 seconds**: ~2-5 seconds
- **60 seconds**: ~3-8 seconds  
- **3 minutes**: ~10-20 seconds

Much faster than AssemblyAI's async polling (30-60 seconds minimum).

## Next Steps

1. **Test transcription** with a new video recording
2. **Verify culture tags** generate automatically
3. **Monitor logs** for any Deepgram errors
4. **Check Firebase** for saved transcripts

## Support

- Deepgram Discord: https://dpgr.am/discord
- Deepgram Support: https://developers.deepgram.com/
