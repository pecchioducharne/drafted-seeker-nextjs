// netlify/functions/searchUniversities.js
const fetch = require("node-fetch");

exports.handler = async function (event) {
  // Allow from localhost and production
  const origin = event.headers.origin;
  const allowedOrigins = [
    "http://localhost:3000",
    "https://candidate.joindrafted.com"
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
    const { query } = JSON.parse(event.body);

    if (!query) {
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": allowedOrigin },
        body: JSON.stringify({ error: "query is required" }),
      };
    }

    // Use environment variable for College API key
    const apiKey = process.env.COLLEGE_API_KEY;
    
    if (!apiKey) {
      console.warn('⚠️ COLLEGE_API_KEY not set, using fallback');
      // Return fallback without API call
      return {
        statusCode: 200,
        headers: { "Access-Control-Allow-Origin": allowedOrigin },
        body: JSON.stringify({
          results: [
            { id: query, school: { name: `${query} (Add as custom university)` } },
            { id: 'other', school: { name: 'Other University (please specify)' } }
          ]
        }),
      };
    }

    console.log('🏫 Searching universities for:', query);

    // Call the College Scorecard API
    const response = await fetch(
      `https://api.data.gov/ed/collegescorecard/v1/schools.json?school.name=${encodeURIComponent(query)}&api_key=${apiKey}`,
      {
        method: 'GET',
      }
    );

    if (!response.ok) {
      console.error('❌ College API failed:', response.status, response.statusText);
      
      // Return fallback options if API fails
      return {
        statusCode: 200,
        headers: { "Access-Control-Allow-Origin": allowedOrigin },
        body: JSON.stringify({
          results: [
            { id: query, school: { name: `${query} (Add as custom university)` } },
            { id: 'other', school: { name: 'Other University (please specify)' } },
            { id: 'harvard', school: { name: 'Harvard University' } },
            { id: 'stanford', school: { name: 'Stanford University' } },
            { id: 'mit', school: { name: 'Massachusetts Institute of Technology' } },
            { id: 'ucla', school: { name: 'University of California, Los Angeles' } },
            { id: 'berkeley', school: { name: 'University of California, Berkeley' } }
          ].filter(uni =>
            uni.school.name.toLowerCase().includes(query.toLowerCase())
          )
        }),
      };
    }

    const data = await response.json();
    console.log(`✅ Found ${data.results.length} universities for "${query}"`);

    // If no results from API, provide fallback
    if (!data.results || data.results.length === 0) {
      return {
        statusCode: 200,
        headers: { "Access-Control-Allow-Origin": allowedOrigin },
        body: JSON.stringify({
          results: [
            { id: query, school: { name: `${query} (Add as custom university)` } },
            { id: 'other', school: { name: 'Other University (please specify)' } }
          ]
        }),
      };
    }

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": allowedOrigin },
      body: JSON.stringify(data),
    };

  } catch (error) {
    console.error('❌ University search function error:', error);
    
    // Always provide fallback options
    const { query } = JSON.parse(event.body || '{}');
    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": allowedOrigin },
      body: JSON.stringify({
        results: [
          { id: query || 'custom', school: { name: `${query || 'Custom'} (Add as custom university)` } },
          { id: 'other', school: { name: 'Other University (please specify)' } }
        ]
      }),
    };
  }
};
