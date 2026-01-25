/**
 * Firebase Video Upload Service
 * Handles video uploads to Firebase Storage with progress tracking
 */

import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { storage, db } from '../firebase';

/**
 * Upload a video blob to Firebase Storage
 * @param {Blob} blob - Video blob to upload
 * @param {string} userId - User ID or email
 * @param {number} videoNumber - Video question number (1, 2, or 3)
 * @param {function} onProgress - Progress callback (0-100)
 * @returns {Promise<string>} - Download URL
 */
export async function uploadVideo(blob, userId, videoNumber, onProgress) {
  if (!blob) {
    throw new Error('No video blob provided');
  }

  if (!userId) {
    throw new Error('User ID is required');
  }

  // Determine file extension based on mime type
  const isMP4 = blob.type?.includes('mp4');
  const extension = isMP4 ? 'mp4' : 'webm';
  const timestamp = Date.now();
  
  // Create storage reference
  const storagePath = `videos/${userId}/video_${timestamp}.${extension}`;
  const storageRef = ref(storage, storagePath);

  // Set metadata
  const metadata = {
    contentType: blob.type || `video/${extension}`,
    customMetadata: {
      owner: userId,
      videoNumber: String(videoNumber),
      timestamp: new Date().toISOString(),
      uploadedFrom: 'drafted-seeker-nextjs'
    }
  };

  // Create upload task
  const uploadTask = uploadBytesResumable(storageRef, blob, metadata);

  // Return promise that resolves with download URL
  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        // Calculate and report progress
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.(Math.round(progress));
        
        // Log progress state
        switch (snapshot.state) {
          case 'paused':
            console.log('Upload paused');
            break;
          case 'running':
            console.log(`Upload progress: ${Math.round(progress)}%`);
            break;
        }
      },
      (error) => {
        // Handle errors
        console.error('Upload error:', error);
        
        let errorMessage = 'Failed to upload video';
        switch (error.code) {
          case 'storage/unauthorized':
            errorMessage = 'You are not authorized to upload videos';
            break;
          case 'storage/canceled':
            errorMessage = 'Upload was cancelled';
            break;
          case 'storage/quota-exceeded':
            errorMessage = 'Storage quota exceeded';
            break;
          case 'storage/invalid-checksum':
            errorMessage = 'File was corrupted during upload';
            break;
          case 'storage/retry-limit-exceeded':
            errorMessage = 'Upload failed after multiple retries';
            break;
          default:
            errorMessage = error.message || 'Unknown upload error';
        }
        
        reject(new Error(errorMessage));
      },
      async () => {
        // Upload completed - get download URL
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          console.log('Video uploaded successfully:', downloadURL);
          resolve(downloadURL);
        } catch (err) {
          reject(new Error('Failed to get download URL'));
        }
      }
    );
  });
}

/**
 * Upload video and update Firestore document
 * @param {Blob} blob - Video blob
 * @param {string} userEmail - User email (used as document ID)
 * @param {number} videoNumber - Video question number (1, 2, or 3)
 * @param {function} onProgress - Progress callback
 * @returns {Promise<{url: string, saved: boolean}>}
 */
export async function uploadVideoAndSave(blob, userEmail, videoNumber, onProgress) {
  // Upload to storage
  const downloadURL = await uploadVideo(blob, userEmail, videoNumber, onProgress);
  
  // Update Firestore document with video URL
  try {
    const userDocRef = doc(db, 'drafted-accounts', userEmail);
    await updateDoc(userDocRef, {
      [`video${videoNumber}`]: downloadURL,
      [`video${videoNumber}UploadedAt`]: new Date().toISOString()
    });
    
    return { url: downloadURL, saved: true };
  } catch (firestoreError) {
    console.error('Failed to save video URL to Firestore:', firestoreError);
    // Return the URL even if Firestore update failed
    return { url: downloadURL, saved: false };
  }
}

/**
 * Upload screen recording (for video 3)
 * @param {Blob} blob - Screen recording blob
 * @param {string} userEmail - User email
 * @param {function} onProgress - Progress callback
 * @returns {Promise<{url: string, saved: boolean}>}
 */
export async function uploadScreenRecording(blob, userEmail, onProgress) {
  return uploadVideoAndSave(blob, userEmail, 3, onProgress);
}

/**
 * Generate a unique storage path for a video
 * @param {string} userId - User ID
 * @param {number} videoNumber - Video number
 * @param {string} extension - File extension
 * @returns {string} Storage path
 */
export function generateVideoPath(userId, videoNumber, extension = 'mp4') {
  const timestamp = Date.now();
  return `videos/${userId}/video${videoNumber}_${timestamp}.${extension}`;
}

export default {
  uploadVideo,
  uploadVideoAndSave,
  uploadScreenRecording,
  generateVideoPath
};
