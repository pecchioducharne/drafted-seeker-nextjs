// netlify/functions/transcribeVideo.js
const fetch = require("node-fetch");

exports.handler = async function (event) {
  // Allow from frontend (production and local dev)
  const origin = event.headers.origin;
  const allowedOrigins = [
    "http://localhost:3000",
    "https://candidate.joindrafted.com",
    "https://draftedseeker.netlify.app"
  ];
  const allowedOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": allowedOrigin,
        "Access-Control-Allow-Headers": "content-type",
        "Access-Control-Allow-Methods": "POST",
      },
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "Access-Control-Allow-Origin": allowedOrigin },
      body: JSON.stringify({ error: "POST required" }),
    };
  }

  try {
    const { videoURL } = JSON.parse(event.body);

    if (!videoURL) {
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": allowedOrigin },
        body: JSON.stringify({ error: "videoURL is required" }),
      };
    }

    // Use environment variable for AssemblyAI API key
    const apiKey = process.env.ASSEMBLYAI_API_KEY;
    
    if (!apiKey) {
      return {
        statusCode: 500,
        headers: { "Access-Control-Allow-Origin": allowedOrigin },
        body: JSON.stringify({ error: "ASSEMBLYAI_API_KEY environment variable not set" }),
      };
    }

    console.log('🎤 Starting transcription for video URL:', videoURL);

    // Submit the audio URL to AssemblyAI for transcription
    const response = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: {
        authorization: apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audio_url: videoURL,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ AssemblyAI submission failed:', error);
      return {
        statusCode: response.status,
        headers: { "Access-Control-Allow-Origin": allowedOrigin },
        body: JSON.stringify({ error: `AssemblyAI error: ${error}` }),
      };
    }

    const data = await response.json();
    const transcriptId = data.id;

    console.log('✅ Transcription job submitted with ID:', transcriptId);

    // Poll for the transcription result (max 10 minutes)
    const maxPollingTime = 10 * 60 * 1000; // 10 minutes
    const pollingInterval = 5000; // 5 seconds
    const startTime = Date.now();

    while (Date.now() - startTime < maxPollingTime) {
      const result = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
        headers: {
          authorization: apiKey,
        },
      });

      if (!result.ok) {
        const error = await result.text();
        console.error('❌ AssemblyAI polling failed:', error);
        return {
          statusCode: result.status,
          headers: { "Access-Control-Allow-Origin": allowedOrigin },
          body: JSON.stringify({ error: `AssemblyAI polling error: ${error}` }),
        };
      }

      const resultData = await result.json();
      
      if (resultData.status === 'completed') {
        console.log('✅ Transcription completed successfully');
        return {
          statusCode: 200,
          headers: { "Access-Control-Allow-Origin": allowedOrigin },
          body: JSON.stringify({ 
            transcript: resultData.text,
            transcriptId: transcriptId 
          }),
        };
      } else if (resultData.status === 'failed') {
        console.error('❌ Transcription failed:', resultData.error);
        return {
          statusCode: 500,
          headers: { "Access-Control-Allow-Origin": allowedOrigin },
          body: JSON.stringify({ error: 'Transcription failed' }),
        };
      }

      // Wait before polling again
      await new Promise(resolve => setTimeout(resolve, pollingInterval));
    }

    // Timeout
    console.error('❌ Transcription timed out');
    return {
      statusCode: 408,
      headers: { "Access-Control-Allow-Origin": allowedOrigin },
      body: JSON.stringify({ error: 'Transcription timed out' }),
    };

  } catch (error) {
    console.error('❌ Transcription function error:', error);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": allowedOrigin },
      body: JSON.stringify({ error: error.message }),
    };
  }
};
