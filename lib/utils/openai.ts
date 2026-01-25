// src/utils/openai.ts
export async function askOpenAI(
    messages: Array<{ role: "user" | "assistant" | "system"; content: string }>,
    model = "gpt-4o-mini"
  ) {
    // Convert messages array to systemMessage and prompt format
    const systemMessage = messages.find(m => m.role === "system")?.content || "";
    const prompt = messages.find(m => m.role === "user")?.content || "";

    const res = await fetch("/.netlify/functions/askOpenAI", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ systemMessage, prompt, model }),
    });
  
    if (!res.ok) throw new Error(`OpenAI error ${res.status}`);
  
    const result = await res.json();
    // Convert askOpenAI response format to match expected OpenAI completion format
    return {
      choices: [
        {
          message: {
            content: result.content
          }
        }
      ]
    };
  }
  