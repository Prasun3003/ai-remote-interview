import { action } from "./_generated/server";
import { v } from "convex/values";

export const generateProblemWithOpenAI = action({
  args: {
    prompt: v.string(),
  },
  handler: async (_, args) => {
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      throw new Error("OpenAI API key not configured");
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo-1106",
        messages: [
          {
            role: "system",
            content:
              "You are an expert coding interview problem generator. Generate high-quality coding problems suitable for technical interviews.",
          },
          {
            role: "user",
            content: args.prompt,
          },
        ],
        temperature: 0.7,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  },
});
