'use client';

import { useState } from 'react';
import ScheduleCalendar from './ScheduleCalendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, Code2, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ResponseDisplayProps {
  response: string | null;
  error: string | null;
}

export default function ResponseDisplay({ response, error }: ResponseDisplayProps) {
  const [showRaw, setShowRaw] = useState(false);

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <CardTitle className="text-destructive">Error</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!response) return null;

  // Try to parse JSON from response
  let scheduleData = null;
  let parseError: Error | null = null;
  try {
    let jsonStr = response.trim();
    
    // Remove markdown code blocks if present
    if (jsonStr.includes('```json')) {
      const match = jsonStr.match(/```json\s*([\s\S]*?)\s*```/);
      if (match) jsonStr = match[1].trim();
    } else if (jsonStr.includes('```')) {
      const match = jsonStr.match(/```\s*([\s\S]*?)\s*```/);
      if (match) jsonStr = match[1].trim();
    }
    
    // If it starts with {, try to parse it directly
    if (jsonStr.startsWith('{')) {
      // Try to find the complete JSON object by balancing braces
      let braceCount = 0;
      let lastValidIndex = -1;
      let inString = false;
      let escapeNext = false;
      
      for (let i = 0; i < jsonStr.length; i++) {
        const char = jsonStr[i];
        
        if (escapeNext) {
          escapeNext = false;
          continue;
        }
        
        if (char === '\\') {
          escapeNext = true;
          continue;
        }
        
        if (char === '"') {
          inString = !inString;
          continue;
        }
        
        if (!inString) {
          if (char === '{') braceCount++;
          if (char === '}') {
            braceCount--;
            if (braceCount === 0) {
              lastValidIndex = i;
              break;
            }
          }
        }
      }
      
      if (lastValidIndex > 0) {
        jsonStr = jsonStr.substring(0, lastValidIndex + 1);
        try {
          scheduleData = JSON.parse(jsonStr);
        } catch (parseErr) {
          // If parsing fails, try to fix incomplete arrays/objects
          let fixedJson = jsonStr;
          let bracketCount = 0;
          let braceCount = 0;
          let inString = false;
          let escapeNext = false;
          
          // Count brackets and braces
          for (let i = 0; i < fixedJson.length; i++) {
            const char = fixedJson[i];
            if (escapeNext) {
              escapeNext = false;
              continue;
            }
            if (char === '\\') {
              escapeNext = true;
              continue;
            }
            if (char === '"') {
              inString = !inString;
              continue;
            }
            if (!inString) {
              if (char === '[') bracketCount++;
              if (char === ']') bracketCount--;
              if (char === '{') braceCount++;
              if (char === '}') braceCount--;
            }
          }
          
          // Remove trailing comma if present before closing
          fixedJson = fixedJson.replace(/,\s*$/, '');
          
          // Close any open brackets first (inner structures)
          while (bracketCount > 0) {
            fixedJson += ']';
            bracketCount--;
          }
          
          // Then close any open braces
          while (braceCount > 0) {
            fixedJson += '}';
            braceCount--;
          }
          
          // Try parsing the fixed JSON
          try {
            scheduleData = JSON.parse(fixedJson);
            console.log('Successfully parsed fixed JSON');
          } catch {
            // If still fails, throw original error
            throw parseErr;
          }
        }
      } else {
        // If we can't find a complete JSON, try parsing what we have
        // This might fail but we'll catch it
        scheduleData = JSON.parse(jsonStr);
      }
    } else {
      // Try to find JSON object in the text
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        let matchedJson = jsonMatch[0];
        // Balance braces for the matched JSON
        let braceCount = 0;
        let lastValidIndex = -1;
        let inString = false;
        let escapeNext = false;
        
        for (let i = 0; i < matchedJson.length; i++) {
          const char = matchedJson[i];
          
          if (escapeNext) {
            escapeNext = false;
            continue;
          }
          
          if (char === '\\') {
            escapeNext = true;
            continue;
          }
          
          if (char === '"') {
            inString = !inString;
            continue;
          }
          
          if (!inString) {
            if (char === '{') braceCount++;
            if (char === '}') {
              braceCount--;
              if (braceCount === 0) {
                lastValidIndex = i;
                break;
              }
            }
          }
        }
        if (lastValidIndex > 0) {
          matchedJson = matchedJson.substring(0, lastValidIndex + 1);
        }
        scheduleData = JSON.parse(matchedJson);
      }
    }
  } catch (e) {
    parseError = e instanceof Error ? e : new Error(String(e));
    console.error('Failed to parse JSON:', e);
    console.log('Response length:', response.length);
    console.log('Response text (first 1000 chars):', response.substring(0, 1000));
    console.log('Response text (last 500 chars):', response.substring(Math.max(0, response.length - 500)));
  }

  // Debug: log if we successfully parsed
  if (scheduleData) {
    console.log('Successfully parsed schedule data:', {
      hasWorkload: !!scheduleData.workload_breakdown,
      hasSchedule: !!scheduleData.weekly_schedule,
      scheduleItems: scheduleData.weekly_schedule?.length || 0
    });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <CardTitle>AI Schedule Recommendations</CardTitle>
            {scheduleData && (
              <Badge variant="secondary" className="ml-2">
                <Calendar className="h-3 w-3 mr-1" />
                Calendar View
              </Badge>
            )}
          </div>
          {scheduleData && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRaw(!showRaw)}
            >
              {showRaw ? (
                <>
                  <Calendar className="h-4 w-4 mr-2" />
                  Show Calendar
                </>
              ) : (
                <>
                  <Code2 className="h-4 w-4 mr-2" />
                  Show Raw JSON
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {scheduleData && !showRaw ? (
          <ScheduleCalendar data={scheduleData} />
        ) : (
          <div className="space-y-4">
            {!scheduleData && parseError && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                <p className="text-sm text-destructive font-medium mb-2">
                  ⚠️ JSON Parse Error: {parseError instanceof Error ? parseError.message : String(parseError)}
                </p>
                <p className="text-xs text-muted-foreground">
                  The response may be incomplete or malformed. Response length: {response.length} characters.
                  Check browser console (F12) for full error details.
                </p>
              </div>
            )}
            <div className="rounded-lg border bg-muted/50 p-4">
              <pre className="overflow-x-auto text-sm max-h-[600px] overflow-y-auto">
                <code className="text-foreground whitespace-pre-wrap">
                  {response}
                </code>
              </pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
