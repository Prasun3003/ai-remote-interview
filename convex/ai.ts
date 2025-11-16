import { action } from "./_generated/server";
import { v } from "convex/values";

interface ProblemData {
  title: string;
  description: string;
  examples: Array<{
    input: string;
    output: string;
    explanation: string;
  }>;
  constraints: string[];
  starterCode: {
    javascript: string;
    python: string;
    java: string;
  };
  hints: string[];
}

export const generateProblemWithOpenAI = action({
  args: {
    prompt: v.string(),
  },
  handler: async (_, args): Promise<ProblemData> => {
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      throw new Error("OpenAI API key not configured");
    }

    const systemPrompt = `You are an expert coding interview problem generator. 
      Generate a coding problem with the following requirements:
      - Title: A clear, concise title
      - Description: Detailed problem statement with examples
      - Examples: 2-3 test cases with input, output, and explanation
      - Constraints: 3-5 constraints for the solution
      - Starter Code: In JavaScript, Python, and Java
      - Hints: 3 helpful hints for solving the problem
      
      Format the response as a JSON object with these exact keys:
      {
        "title": "string",
        "description": "string",
        "examples": [{"input": "string", "output": "string", "explanation": "string"}],
        "constraints": ["string"],
        "starterCode": {
          "javascript": "string",
          "python": "string",
          "java": "string"
        },
        "hints": ["string"]
      }`;

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo-1106",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: args.prompt },
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
      const content = data.choices[0].message.content;
      const problemData = JSON.parse(content) as ProblemData;
      
      // Validate the response structure
      if (!problemData.title || !problemData.description || !problemData.examples) {
        throw new Error("Invalid response format from OpenAI API");
      }

      return problemData;
    } catch (error) {
      console.error("Error in generateProblemWithOpenAI:", error);
      throw new Error(`Failed to generate problem: ${error}`);
    }
  },
});
