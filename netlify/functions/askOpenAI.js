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

  try {
    const { systemMessage, prompt, model } = JSON.parse(event.body);

    // Use environment variable
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return {
        statusCode: 500,
        headers: { "Access-Control-Allow-Origin": allowedOrigin },
        body: JSON.stringify({ error: "OPENAI_API_KEY environment variable not set" }),
      };
    }

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model || "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      return {
        statusCode: res.status,
        headers: { "Access-Control-Allow-Origin": allowedOrigin },
        body: JSON.stringify({ error }),
      };
    }

    const data = await res.json();
    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": allowedOrigin },
      body: JSON.stringify({ content: data.choices[0].message.content }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": allowedOrigin },
      body: JSON.stringify({ error: error.message }),
    };
  }
};
