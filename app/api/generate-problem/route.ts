import { NextResponse } from 'next/server';
import { saveProblem } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { difficulty, topic, category } = await request.json();
    const openaiApiKey = process.env.OPENAI_API_KEY;

    if (!openaiApiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const prompt = `Generate a ${difficulty} level coding problem${topic ? ` about ${topic}` : ''}${category ? ` in the ${category} category` : ''}. The problem should be challenging but solvable within 30-45 minutes.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo-1106',
        messages: [
          {
            role: 'system',
            content: `You are an expert coding interview problem generator. 
              Generate a ${difficulty} level coding problem${topic ? ` about ${topic}` : ''}${category ? ` in the ${category} category` : ''}.
              The problem should be solvable in 30-45 minutes.
              Format the response as a valid JSON object with these exact keys:
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
              }`
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const data = await response.json();
    const problemData = JSON.parse(data.choices[0].message.content);

    // Save to MongoDB
    const problem = {
      ...problemData,
      difficulty,
      ...(category && { category }),
      ...(topic && { tags: [topic] }),
    };

    const problemId = await saveProblem(problem);

    return NextResponse.json({
      ...problem,
      _id: problemId,
    });

  } catch (error) {
    console.error('Error generating problem:', error);
    return NextResponse.json(
      { error: 'Failed to generate problem' },
      { status: 500 }
    );
  }
}
