'use client';

import { useState } from 'react';

export default function TestPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testDatabase = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/test-db');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Test failed');
      setResult(data);
    } catch (err) {
      console.error('Test failed:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const generateProblem = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/generate-problem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          difficulty: 'medium',
          topic: 'arrays',
          category: 'algorithms'
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to generate problem');
      setResult(data);
    } catch (err) {
      console.error('Generation failed:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">MongoDB Test Page</h1>
      
      <div className="space-y-4 mb-8">
        <button
          onClick={testDatabase}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
        >
          {loading ? 'Testing...' : 'Test Database Connection'}
        </button>

        <button
          onClick={generateProblem}
          disabled={loading}
          className="ml-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-green-300"
        >
          {loading ? 'Generating...' : 'Generate Problem'}
        </button>
      </div>

      {error && (
        <div className="p-4 mb-6 bg-red-100 border border-red-400 text-red-700 rounded">
          <p className="font-bold">Error:</p>
          <pre className="whitespace-pre-wrap">{error}</pre>
        </div>
      )}

      {result && (
        <div className="mt-6 p-4 bg-gray-50 rounded border">
          <h2 className="text-xl font-semibold mb-2">Result:</h2>
          <pre className="bg-white p-4 rounded overflow-auto max-h-96">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
