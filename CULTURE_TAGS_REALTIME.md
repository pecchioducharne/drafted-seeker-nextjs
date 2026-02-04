# Real-Time Culture Tag Generation

## Overview
Culture tags are now automatically generated and regenerated whenever ANY video is transcribed, with real-time progress tracking in the dashboard.

## How It Works

### 1. **Automatic Generation**
Culture tags are automatically generated after **ANY** video transcription completes:
- Video 1 (What makes you stand out?)
- Video 2 (Walk through your experience)
- Video 3 (Challenge/Project with screen recording)

Previously, tags only generated after video1. Now they regenerate every time to include new transcript content.

### 2. **Real-Time Progress Tracking**

#### Firestore Status Fields:
```javascript
{
  cultureTagsGenerating: true/false,        // Real-time flag
  cultureTagsGeneratingAt: "2026-01-31...", // When generation started
  cultureTagsLastGenerated: "2026-01-31...",// When last completed
  cultureTagsError: "error message"         // If generation failed
}
```

#### Dashboard Listener:
The `ProfileSnapshot` component uses `onSnapshot` to listen for changes in real-time:
- Shows purple gradient loader when `cultureTagsGenerating: true`
- Automatically refreshes and displays tags when generation completes
- No page refresh needed - tags appear instantly

### 3. **Beautiful Purple Gradient Loader**

When generating, displays:
- ✨ Animated spinning disc with purple gradient
- 📊 Pulsing "Generating Culture Tags..." text
- ⚪ Animated dots showing progress
- 📉 Moving progress bar

All styling matches the purple gradient theme of the culture tags themselves.

### 4. **Manual Regeneration**

Users can manually regenerate tags via the "Regenerate" button:
- Requires at least one video transcript
- Shows the same real-time loader
- Updates instantly when complete

## User Experience Flow

### Recording a Video:
1. User records video → Upload complete
2. Transcription starts (30-60 seconds)
3. **Dashboard automatically shows loader**: "Generating Culture Tags..."
4. **Tags appear automatically** when generation completes (no refresh needed)

### Re-recording a Video:
1. User re-records any video
2. New transcript created
3. Culture tags automatically regenerate with updated content
4. Dashboard shows loader → New tags appear

### First Time User:
1. No videos recorded yet
2. Dashboard shows: "Record videos to generate your culture tags!"
3. After first video transcript completes
4. Loader appears → 4 culture tags generated
5. Click any tag to see personalized description in modal

## Technical Implementation

### TranscriptionService Changes:
```javascript
// After transcription completes for ANY video:
await updateDoc(userDocRef, {
  cultureTagsGenerating: true,
  cultureTagsGeneratingAt: new Date().toISOString()
});

await generateCultureTags(userEmail);

await updateDoc(userDocRef, {
  cultureTagsGenerating: false,
  cultureTagsLastGenerated: new Date().toISOString()
});
```

### ProfileSnapshot Changes:
```javascript
// Real-time listener
useEffect(() => {
  const unsubscribe = onSnapshot(userDocRef, (doc) => {
    const isGenerating = doc.data().cultureTagsGenerating;
    setCultureTagsGenerating(isGenerating);
    
    if (!isGenerating && doc.data().cultureTagsLastGenerated) {
      refreshProfile(); // Auto-refresh to show new tags
    }
  });
  
  return () => unsubscribe();
}, []);
```

## Benefits

1. ✅ **Always Up-to-Date**: Tags reflect ALL recorded videos, not just video1
2. ✅ **Real-Time Feedback**: Users see generation in progress
3. ✅ **No Refresh Needed**: Tags appear automatically when ready
4. ✅ **Better UX**: Beautiful loader with purple gradient theme
5. ✅ **Resilient**: Error handling and flag cleanup on failures
6. ✅ **Screen Recording Support**: Video 3 transcripts now included in tag generation

## Screen Recording Transcription

Video 3 (screen recording with voiceover) is fully transcribed:
- `uploadScreenRecording()` → `uploadVideoAndSave()` → `transcribeAudio()`
- AssemblyAI extracts audio from screen recording
- Transcript includes everything user says during demo
- Culture tags incorporate insights from project/challenge explanations

## What Gets Transcribed

- **Video 1**: "What makes you stand out?" (30 sec face video)
- **Video 2**: "Walk through your experience" (60 sec face video)  
- **Video 3**: "Challenge/Project demo" (3 min screen + audio)

All three transcripts are combined to generate the most accurate culture tags.
