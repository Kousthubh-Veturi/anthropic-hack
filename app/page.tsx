'use client';

import { useState } from 'react';
import ScheduleForm from '@/components/ScheduleForm';
import ResponseDisplay from '@/components/ResponseDisplay';

export default function Home() {
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: {
    courses: Array<{ name: string; time: string }>;
    clubs: Array<{ name: string; time: string }>;
    goals: string;
  }) => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to get response from AI');
      }

      const result = await res.json();
      setResponse(result.response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            AI Schedule Planner
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Enter your courses, clubs, and goals to get personalized AI recommendations
          </p>
        </div>

        <ScheduleForm onSubmit={handleSubmit} loading={loading} />

        {(response || error) && (
          <ResponseDisplay response={response} error={error} />
        )}
      </div>
    </main>
  );
}

