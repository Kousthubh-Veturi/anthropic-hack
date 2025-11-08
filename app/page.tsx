'use client';

import { useState } from 'react';
import ScheduleForm from '@/components/ScheduleForm';
import ResponseDisplay from '@/components/ResponseDisplay';
import { Card } from '@/components/ui/card';

export default function Home() {
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: {
    courses: Array<{ name: string; courseId: string; time: string }>;
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
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="text-center mb-8 space-y-2">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            AI Schedule Planner
          </h1>
          <p className="text-muted-foreground text-lg">
            Enter your courses, clubs, and goals to get personalized AI-powered schedule recommendations
          </p>
        </div>

        <div className="space-y-6">
          <ScheduleForm onSubmit={handleSubmit} loading={loading} />

          {(response || error) && (
            <ResponseDisplay response={response} error={error} />
          )}
        </div>
      </div>
    </main>
  );
}
