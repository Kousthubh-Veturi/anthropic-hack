import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Read the scheduling engine prompt from prompt.md
import { readFileSync } from 'fs';
import { join } from 'path';

function getSchedulingPrompt(): string {
  try {
    const promptPath = join(process.cwd(), 'prompt.md');
    return readFileSync(promptPath, 'utf-8');
  } catch (error) {
    console.error('Error reading prompt.md:', error);
    return '';
  }
}

// Function to fetch full course data from UMD API
async function fetchCourseData(courseId: string): Promise<any | null> {
  try {
    // UMD API endpoint format: https://api.umd.io/v1/courses/{course_id}
    const response = await fetch(`https://api.umd.io/v1/courses/${courseId.toUpperCase()}`);
    
    if (!response.ok) {
      console.warn(`Failed to fetch course ${courseId}: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    
    // Handle array response (API returns array)
    const course = Array.isArray(data) ? data[0] : data;
    
    return course || null;
  } catch (error) {
    console.error(`Error fetching course ${courseId}:`, error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { courses, clubs, goals } = await request.json();

    // Validate input
    if (!goals || !goals.trim()) {
      return NextResponse.json(
        { error: 'Goals are required' },
        { status: 400 }
      );
    }

    // Check if API key is configured
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key is not configured. Please set GEMINI_API_KEY in your .env.local file.' },
        { status: 500 }
      );
    }

    // Fetch full course data from UMD API for all courses (to get names and full details)
    // This only happens when form is submitted, not on every state change
    const courseDataMap: Record<string, any> = {};
    if (courses && courses.length > 0) {
      console.log('Fetching course data from UMD API...');
      const coursePromises = courses
        .filter((course: { courseId?: string }) => course.courseId && course.courseId.trim())
        .map(async (course: { courseId: string }) => {
          const courseIdUpper = course.courseId.toUpperCase();
          const courseData = await fetchCourseData(courseIdUpper);
          if (courseData) {
            courseDataMap[courseIdUpper] = courseData;
            console.log(`Fetched data for ${courseIdUpper}:`, courseData.name);
          }
        });
      
      await Promise.all(coursePromises);
      console.log('Course data fetch complete');
    }

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(apiKey);
    // Use gemini-2.5-flash (fast and efficient) with optimized generation config
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.3, // Lower temperature for more consistent JSON output
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192, // Allow for large JSON responses
      },
    });

    // Get the scheduling engine prompt from prompt.md
    const schedulingPrompt = getSchedulingPrompt();
    console.log('Scheduling prompt length:', schedulingPrompt.length);
    
    if (!schedulingPrompt) {
      console.warn('Warning: prompt.md is empty or could not be read');
    }

    // Build the input JSON according to prompt.md format
    const coursesInput = courses
      .filter((c: { courseId?: string; time: string }) => c.courseId && c.courseId.trim() && c.time.trim())
      .map((course: { courseId: string; time: string }) => {
        const courseIdUpper = course.courseId.toUpperCase();
        const courseData = courseDataMap[courseIdUpper];
        
        // Parse time to extract days and times (basic parsing - user can improve this)
        // For now, just pass the time string as-is
        return {
          course_id: courseIdUpper,
          provided_meetings: [
            {
              days: "TBD", // User will need to parse this from time string
              start: "TBD",
              end: "TBD",
              time_string: course.time // Pass the full time string
            }
          ],
          credits: courseData?.credits ? parseInt(courseData.credits) : undefined,
          difficulty_hint: undefined,
          exam_weeks: []
        };
      });

    const coursesDetailed = Object.values(courseDataMap);

    const activities = clubs
      .filter((c: { name: string; time: string }) => c.name.trim() && c.time.trim())
      .map((club: { name: string; time: string }) => ({
        name: club.name,
        type: "club",
        fixed_meetings: [{
          days: "TBD",
          start: "TBD",
          end: "TBD",
          time_string: club.time
        }]
      }));

    // Build the full prompt with scheduling engine instructions
    let prompt = `${schedulingPrompt}\n\n`;
    prompt += `================================================================================\n`;
    prompt += `ACTUAL USER INPUT (transform the following into the INPUT JSON format above):\n`;
    prompt += `================================================================================\n\n`;
    
    prompt += `Courses:\n`;
    courses.forEach((course: { courseId: string; time: string }) => {
      const courseIdUpper = course.courseId.toUpperCase();
      const courseData = courseDataMap[courseIdUpper];
      const courseName = courseData?.name || courseIdUpper;
      prompt += `- ${courseName} (${courseIdUpper}): ${course.time}\n`;
      if (courseData) {
        if (courseData.description) prompt += `  Description: ${courseData.description}\n`;
        if (courseData.credits) prompt += `  Credits: ${courseData.credits}\n`;
        if (courseData.relationships?.prereqs) prompt += `  Prerequisites: ${courseData.relationships.prereqs}\n`;
        if (courseData.relationships?.coreqs) prompt += `  Corequisites: ${courseData.relationships.coreqs}\n`;
      }
    });
    
    if (clubs.length > 0) {
      prompt += `\nClubs/Activities:\n`;
      clubs.forEach((club: { name: string; time: string }) => {
        prompt += `- ${club.name}: ${club.time}\n`;
      });
    }
    
    prompt += `\nGoals:\n${goals}\n\n`;
    prompt += `Please follow the instructions in the scheduling engine prompt above and return the OUTPUT JSON schema exactly as specified.`;

    console.log('Prompt length:', prompt.length, 'characters');
    console.log('Calling Gemini API...');
    
    // Generate content with timeout handling
    const startTime = Date.now();
    let result;
    try {
      // Add a timeout wrapper
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Gemini API call timed out after 60 seconds')), 60000);
      });
      
      result = await Promise.race([
        model.generateContent(prompt),
        timeoutPromise
      ]) as any;
      
      const elapsed = Date.now() - startTime;
      console.log('Gemini API call completed in', elapsed, 'ms');
      
      if (elapsed > 30000) {
        console.warn('Warning: API call took longer than 30 seconds');
      }
    } catch (apiError) {
      const elapsed = Date.now() - startTime;
      console.error('Gemini API error after', elapsed, 'ms:', apiError);
      throw apiError;
    }
    
    const response = await result.response;
    const text = response.text();
    console.log('Response received, length:', text.length, 'characters');

    return NextResponse.json({ response: text });
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    
    if (error instanceof Error) {
      // Handle specific Gemini API errors
      if (error.message.includes('API_KEY')) {
        return NextResponse.json(
          { error: 'Invalid API key. Please check your GEMINI_API_KEY in .env.local' },
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        { error: `Failed to get AI response: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

