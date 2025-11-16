import { NextResponse } from 'next/server';
import { saveProblem, getProblems } from '@/lib/db';

export async function GET() {
  try {
    // Test saving a problem
    const testProblem = {
      title: 'Test Problem',
      description: 'This is a test problem',
      difficulty: 'easy' as const,
      examples: [
        {
          input: 'test input',
          output: 'test output',
          explanation: 'test explanation',
        },
      ],
      constraints: ['1 <= n <= 100'],
      starterCode: {
        javascript: 'function test() { return "Hello"; }',
        python: `def test():
    return "Hello"`,
        java: `public class Test {
    public String test() {
        return "Hello";
    }
}`,
      },
      hints: ['Hint 1', 'Hint 2'],
    };

    const id = await saveProblem(testProblem);
    
    // Retrieve all problems
    const problems = await getProblems();

    return NextResponse.json({
      message: 'Database test successful',
      insertedId: id,
      problems,
    });
  } catch (error) {
    console.error('Database test failed:', error);
    return NextResponse.json(
      { error: 'Database test failed', details: error },
      { status: 500 }
    );
  }
}
