'use client';

import { useState } from 'react';
import ScheduleCalendar from './ScheduleCalendar';

interface ResponseDisplayProps {
  response: string | null;
  error: string | null;
}

export default function ResponseDisplay({ response, error }: ResponseDisplayProps) {
  const [showRaw, setShowRaw] = useState(false);

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 mb-6">
        <div className="flex items-start">
          <svg className="w-6 h-6 text-red-600 dark:text-red-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">Error</h3>
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!response) return null;

  // Try to parse JSON from response
  let scheduleData = null;
  try {
    // Extract JSON from markdown code blocks if present
    const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || response.match(/```\s*([\s\S]*?)\s*```/);
    const jsonStr = jsonMatch ? jsonMatch[1] : response;
    scheduleData = JSON.parse(jsonStr.trim());
  } catch (e) {
    // If not JSON, display as text
    console.log('Response is not JSON, displaying as text');
  }

  return (
    <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 border border-green-200 dark:border-gray-600 rounded-lg p-6 shadow-lg mb-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start">
          <svg className="w-6 h-6 text-green-600 dark:text-green-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white">AI Recommendations</h3>
        </div>
        {scheduleData && (
          <button
            onClick={() => setShowRaw(!showRaw)}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
          >
            {showRaw ? 'Show Calendar' : 'Show Raw JSON'}
          </button>
        )}
      </div>

      {scheduleData && !showRaw ? (
        <ScheduleCalendar data={scheduleData} />
      ) : (
        <div className="prose dark:prose-invert max-w-none">
          <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm">
            <code className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
              {response}
            </code>
          </pre>
        </div>
      )}
    </div>
  );
}

