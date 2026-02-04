import { ref, getDownloadURL, uploadBytes } from "firebase/storage";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { storage, db } from "../firebase";

const transcribeAudio = async (videoBlob, userEmail, position) => {
  const maxRetries = 3;
  let attempt = 1;

  while (attempt <= maxRetries) {
    try {
      console.log(`🎤 Starting transcription attempt ${attempt}/${maxRetries} for ${userEmail} (video ${position})`);

      // Upload the video to Firebase Storage to get a URL
      const fileName = `transcription_video_${Date.now()}.mp4`;
      const storageRef = ref(storage, fileName);
      await uploadBytes(storageRef, videoBlob);
      const videoURL = await getDownloadURL(storageRef);

      console.log('📁 Video uploaded to Firebase Storage:', videoURL);

      // Call secure Netlify function to transcribe the audio
      const transcript = await fetchTranscriptionSecure(videoURL);

      // Get the current transcripts array
      const userDocRef = doc(db, "drafted-accounts", userEmail);
      const userDoc = await getDoc(userDocRef);
      let transcripts = userDoc.exists() ? userDoc.data().transcripts || [] : [];

      // Ensure the array has enough slots
      while (transcripts.length < 3) {
        transcripts.push("");
      }

      // Update the transcript at the specified position
      transcripts[position - 1] = transcript;

      // Update Firestore with the new transcripts array
      await updateDoc(userDocRef, {
        transcripts: transcripts,
      });

      console.log(`✅ Transcription completed and saved for ${userEmail} (video ${position})`);

      // 🎯 AUTOMATIC CULTURE TAG GENERATION
      // Regenerate culture tags whenever ANY video transcript is created/updated
      try {
        console.log('🏷️ Triggering automatic culture tag generation...');
        
        // Set generating flag in Firestore
        await updateDoc(userDocRef, {
          cultureTagsGenerating: true,
          cultureTagsGeneratingAt: new Date().toISOString()
        });
        
        // Generate culture tags from all available transcripts
        const { default: generateCultureTags } = await import('./CultureTagService');
        await generateCultureTags(userEmail);
        
        // Clear generating flag
        await updateDoc(userDocRef, {
          cultureTagsGenerating: false,
          cultureTagsLastGenerated: new Date().toISOString()
        });
        
        console.log('✅ Culture tags generated automatically after video transcription');
      } catch (cultureError) {
        console.error('❌ Failed to generate culture tags automatically:', cultureError);
        // Clear the generating flag even on error
        try {
          await updateDoc(userDocRef, {
            cultureTagsGenerating: false,
            cultureTagsError: cultureError.message
          });
        } catch (flagError) {
          console.error('Failed to clear generating flag:', flagError);
        }
      }

      return; // Success - exit retry loop

    } catch (error) {
      console.error(`❌ Transcription attempt ${attempt} failed for ${userEmail}:`, error);
      
      if (attempt === maxRetries) {
        console.error(`❌ All ${maxRetries} transcription attempts failed for ${userEmail}`);
        // Could send notification to admin here
        throw error;
      }
      
      attempt++;
      // Wait before retrying (exponential backoff)
      const waitTime = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s
      console.log(`⏳ Waiting ${waitTime}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
};

const fetchTranscriptionSecure = async (videoURL) => {
  try {
    console.log('🔐 Calling secure Netlify function for transcription...');
    
    // Use secure Netlify function instead of direct API call
    const response = await fetch('/.netlify/functions/transcribeVideo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        videoURL: videoURL,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Secure transcription completed');
    
    return result.transcript;
  } catch (error) {
    console.error("❌ Error fetching secure transcription:", error);
    throw error;
  }
};

export default transcribeAudio;
