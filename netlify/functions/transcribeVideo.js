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

    // Use environment variable for Deepgram API key
    const apiKey = process.env.DEEPGRAM_API_KEY;
    
    if (!apiKey) {
      return {
        statusCode: 500,
        headers: { "Access-Control-Allow-Origin": allowedOrigin },
        body: JSON.stringify({ error: "DEEPGRAM_API_KEY environment variable not set" }),
      };
    }

    console.log('🎤 Starting Deepgram transcription for video URL:', videoURL);

    // Submit the audio URL to Deepgram for transcription
    // Using Nova-2 model with smart formatting for better accuracy
    const response = await fetch('https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&punctuate=true&diarize=false', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: videoURL,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Deepgram transcription failed:', error);
      return {
        statusCode: response.status,
        headers: { "Access-Control-Allow-Origin": allowedOrigin },
        body: JSON.stringify({ error: `Deepgram error: ${error}` }),
      };
    }

    const data = await response.json();
    
    // Extract transcript from Deepgram response
    // Deepgram returns: results.channels[0].alternatives[0].transcript
    const transcript = data?.results?.channels?.[0]?.alternatives?.[0]?.transcript;

    if (!transcript) {
      console.error('❌ No transcript in Deepgram response:', JSON.stringify(data));
      return {
        statusCode: 500,
        headers: { "Access-Control-Allow-Origin": allowedOrigin },
        body: JSON.stringify({ error: 'No transcript in response' }),
      };
    }

    console.log('✅ Deepgram transcription completed successfully');
    console.log('📝 Transcript length:', transcript.length, 'characters');

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": allowedOrigin },
      body: JSON.stringify({ 
        transcript: transcript,
        provider: 'deepgram',
        model: 'nova-2'
      }),
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
