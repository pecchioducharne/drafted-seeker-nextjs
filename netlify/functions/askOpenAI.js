// netlify/functions/askOpenAI.js

const OpenAI = require('openai');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { systemMessage, prompt, model = 'gpt-3.5-turbo' } = JSON.parse(event.body);

    if (!prompt) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Prompt is required' })
      };
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    // Create messages array
    const messages = [];
    
    if (systemMessage) {
      messages.push({
        role: 'system',
        content: systemMessage
      });
    }
    
    messages.push({
      role: 'user',
      content: prompt
    });

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: model,
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000
    });

    const responseContent = completion.choices[0].message.content;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        content: responseContent,
        model: model
      })
    };

  } catch (error) {
    console.error('OpenAI API Error:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to generate response',
        details: error.message
      })
    };
  }
};
