const fetch = require("node-fetch");

exports.handler = async function (event) {
  try {
    const { systemMessage, prompt, model } = JSON.parse(event.body);

    // Use environment variable
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return {
        statusCode: 500,
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
        body: JSON.stringify({ error }),
      };
    }

    const data = await res.json();
    return {
      statusCode: 200,
      body: JSON.stringify({ content: data.choices[0].message.content }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
